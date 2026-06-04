//! JSON-RPC and HTTP proxy — transparently forwards requests from browser to Odoo.

use crate::AppState;
use crate::cache;
use crate::error::AppError;
use axum::Json;
use axum::http::HeaderMap;
use axum::http::Method;
use axum::response::{IntoResponse, Response};
use futures::StreamExt;
use odoo_core::error::OdooError;

/// POST /api/odoo/{*path}
///
/// Transparently forwards the JSON-RPC request to Odoo, passing
/// Cookie headers through manually (no shared cookie store).
/// Responses for cacheable methods (fields_get, get_views, name_search) are cached.
pub async fn proxy_odoo(
    state: AppState,
    path: &str,
    headers: HeaderMap,
    body: axum::body::Bytes,
) -> Result<Response, AppError> {
    let odoo_url = build_odoo_url(&state.odoo_url, path)?;

    // Try cache for read-only cacheable methods
    if let Ok(cache_key) = try_build_cache_key(&body) {
        let span = tracing::debug_span!("proxy_cache", key = %cache_key);
        if let Some(cached) = {
            let _guard = span.enter();
            state.cache.get(&cache_key).await
        } {
            tracing::debug!("Cache hit");
            crate::metrics::record_proxy_request(
                "POST",
                crate::metrics::labels::CACHE_RESULT_HIT,
                0.0,
            );
            return Ok(Json(cached).into_response());
        }
        tracing::debug!("Cache miss");

        let mut request = state
            .http_client
            .post(&odoo_url)
            .header("Content-Type", "application/json")
            .body(body);
        request = with_cookie(request, &headers);

        let proxy_start = std::time::Instant::now();
        let response = request.send().await.map_err(|e| {
            tracing::warn!("Odoo unreachable at {odoo_url}: {e}");
            OdooError::Unreachable(format!("Odoo not reachable: {e}"))
        })?;

        let status = response.status();
        let odoo_headers = response.headers().clone();
        let body_bytes = response
            .bytes()
            .await
            .map_err(|e| OdooError::Http(e.without_url()))?;

        // Cache successful responses
        if status.is_success()
            && let Ok(value) = serde_json::from_slice::<serde_json::Value>(&body_bytes)
        {
            state.cache.set(&cache_key, value, &cache_key).await;
        }

        crate::metrics::record_proxy_request(
            "POST",
            crate::metrics::labels::CACHE_RESULT_MISS,
            proxy_start.elapsed().as_secs_f64(),
        );
        return build_proxy_response(status, &odoo_headers, axum::body::Body::from(body_bytes));
    }

    // Not cacheable — proxy normally
    tracing::debug!("Proxying JSON-RPC POST to: {odoo_url}");

    let method = extract_method(&body);
    if let Some(ref m) = method
        && (m == "button_immediate_install" || m == "button_immediate_upgrade")
    {
        state.cache.invalidate("session:menus").await;
        state.cache.invalidate("menus:enriched").await;
    }

    let mut request = state
        .http_client
        .post(&odoo_url)
        .header("Content-Type", "application/json")
        .body(body);
    request = with_cookie(request, &headers);

    proxy_send(&state, request).await
}

/// ANY /api/odoo-http/{*path}
pub async fn proxy_odoo_http(
    state: AppState,
    method: Method,
    path: &str,
    headers: HeaderMap,
    query: Option<String>,
    body: axum::body::Bytes,
) -> Result<Response, AppError> {
    let mut url = build_odoo_url(&state.odoo_url, path)?;
    if let Some(ref q) = query
        && !q.is_empty()
    {
        url.push('?');
        url.push_str(q);
    }
    tracing::debug!("Proxying HTTP {method} to: {url}");

    let mut request = match method {
        Method::GET | Method::HEAD => state.http_client.get(&url),
        Method::POST => state.http_client.post(&url),
        _ => {
            return Err(AppError(OdooError::Api {
                code: 405,
                message: "Method not allowed".into(),
                data: None,
            }));
        }
    };

    if !body.is_empty() {
        if let Some(ct) = headers.get("content-type").and_then(|v| v.to_str().ok()) {
            request = request.header("Content-Type", ct);
        }
        request = request.body(body);
    }
    request = with_cookie(request, &headers);

    proxy_send_streaming(&state, request).await
}

/// GET /api/web/image/{*path}
pub async fn proxy_image(
    state: AppState,
    path: axum::extract::Path<String>,
    headers: HeaderMap,
) -> Result<Response, AppError> {
    let image_path = path.0;
    let odoo_url = build_odoo_url(&state.odoo_url, &format!("web/image/{}", image_path))?;
    tracing::debug!("Proxying image request to: {odoo_url}");

    let mut request = state.http_client.get(&odoo_url);
    request = with_cookie(request, &headers);
    proxy_send_streaming(&state, request).await
}

// ── Helpers ─────────────────────────────────────────────────

fn build_odoo_url(odoo_base: &str, path: &str) -> Result<String, AppError> {
    // Loop-decode until stable to handle multiple layers of percent-encoding
    let mut decoded = path.to_string();
    loop {
        let next = percent_encoding::percent_decode_str(&decoded)
            .decode_utf8()
            .map_err(|_| {
                AppError(OdooError::Api {
                    code: 400,
                    message: "Invalid path encoding".into(),
                    data: None,
                })
            })?;
        let next_str = next.to_string();
        if next_str == decoded {
            break;
        }
        decoded = next_str;
    }

    // Reject null bytes
    if decoded.contains('\0') {
        return Err(AppError(OdooError::Api {
            code: 400,
            message: "Invalid path".into(),
            data: None,
        }));
    }

    for component in std::path::Path::new(&decoded).components() {
        if matches!(component, std::path::Component::ParentDir) {
            return Err(AppError(OdooError::Api {
                code: 400,
                message: "Invalid path".into(),
                data: None,
            }));
        }
    }

    Ok(format!("{}/{}", odoo_base, decoded))
}

/// Attach Cookie and X-Request-Id headers from client request to proxy request
fn with_cookie(request: reqwest::RequestBuilder, headers: &HeaderMap) -> reqwest::RequestBuilder {
    let mut req = request;
    if let Some(c) = headers.get("cookie").and_then(|v| v.to_str().ok()) {
        req = req.header("cookie", c);
    }
    if let Some(rid) = headers.get("x-request-id").and_then(|v| v.to_str().ok()) {
        req = req.header("x-request-id", rid);
    }
    req
}

async fn proxy_send(
    state: &AppState,
    request: reqwest::RequestBuilder,
) -> Result<Response, AppError> {
    proxy_request(state, request, false).await
}

/// Stream response body to avoid buffering large files (reports, images, attachments).
async fn proxy_send_streaming(
    state: &AppState,
    request: reqwest::RequestBuilder,
) -> Result<Response, AppError> {
    proxy_request(state, request, true).await
}

async fn proxy_request(
    state: &AppState,
    request: reqwest::RequestBuilder,
    streaming: bool,
) -> Result<Response, AppError> {
    let request = request.build().map_err(|e| {
        AppError(OdooError::Api {
            code: 500,
            message: format!("Failed to build proxy request: {e}"),
            data: None,
        })
    })?;
    let url = request.url().to_string();
    let method_str = request.method().to_string();

    let proxy_start = std::time::Instant::now();
    let response = state.http_client.execute(request).await.map_err(|e| {
        tracing::warn!("Odoo unreachable at {url}: {e}");
        OdooError::Unreachable(format!("Odoo not reachable: {e}"))
    })?;

    crate::metrics::record_proxy_request(
        &method_str,
        "direct",
        proxy_start.elapsed().as_secs_f64(),
    );

    let status = response.status();
    let odoo_headers = response.headers().clone();

    let body = if streaming {
        let stream = response
            .bytes_stream()
            .map(|r| r.map_err(|e| std::io::Error::other(e.to_string())));
        axum::body::Body::from_stream(stream)
    } else {
        let body_bytes = response
            .bytes()
            .await
            .map_err(|e| OdooError::Http(e.without_url()))?;
        axum::body::Body::from(body_bytes)
    };

    build_proxy_response(status, &odoo_headers, body)
}

fn matches_proxy_header(name: &str) -> bool {
    matches_proxy_header_ignore_case(name)
}

/// Headers allowed to be forwarded from Odoo response to the browser.
static PROXY_HEADERS: &[&str] = &[
    "set-cookie",
    "content-type",
    "content-length",
    "content-disposition",
    "cache-control",
    "etag",
    "last-modified",
    "x-content-type-options",
    "x-frame-options",
    "content-security-policy",
    "strict-transport-security",
    "location",
];

fn matches_proxy_header_ignore_case(name: &str) -> bool {
    PROXY_HEADERS.iter().any(|h| name.eq_ignore_ascii_case(h))
}

/// Build axum Response from Odoo response status + headers + body.
pub(crate) fn build_proxy_response(
    status: reqwest::StatusCode,
    odoo_headers: &HeaderMap,
    body: axum::body::Body,
) -> Result<Response, AppError> {
    let mut builder = Response::builder().status(status);

    for (key, value) in odoo_headers.iter() {
        let name = key.as_str();
        if name.eq_ignore_ascii_case("content-encoding") {
            continue;
        }
        if matches_proxy_header(name)
            && let Ok(v) = value.to_str()
        {
            builder = builder.header(name, v);
        }
    }

    builder.body(body).map_err(|e| {
        AppError(OdooError::InvalidResponse(format!(
            "Failed to build response: {e}"
        )))
    })
}

fn try_build_cache_key(body: &axum::body::Bytes) -> Result<String, ()> {
    let json: serde_json::Value = serde_json::from_slice(body).map_err(|_| ())?;
    let params = json.get("params").ok_or(())?;
    let model = params.get("model").and_then(|v| v.as_str()).ok_or(())?;
    let method = params.get("method").and_then(|v| v.as_str()).ok_or(())?;

    // Never cache write operations (O(log n) binary search on sorted list)
    if WRITE_METHODS.binary_search(&method).is_ok() {
        return Err(());
    }
    let args = params.get("args").ok_or(())?;
    Ok(cache::cache_key(model, method, args))
}

fn extract_method(body: &axum::body::Bytes) -> Option<String> {
    let json: serde_json::Value = serde_json::from_slice(body).ok()?;
    json.get("params")?
        .get("method")?
        .as_str()
        .map(String::from)
}

/// Methods that must never be cached (mutations).
/// Sorted alphabetically for binary search lookup.
static WRITE_METHODS: [&str; 12] = [
    "action_archive",
    "action_unarchive",
    "button_immediate_install",
    "button_immediate_upgrade",
    "copy",
    "create",
    "message_post",
    "message_subscribe",
    "message_unsubscribe",
    "toggle_active",
    "unlink",
    "write",
];

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_url_simple_path() {
        let result = build_odoo_url("http://odoo:8069", "web/session/authenticate").unwrap();
        assert_eq!(result, "http://odoo:8069/web/session/authenticate");
    }

    #[test]
    fn build_url_rejects_literal_dot_dot() {
        let result = build_odoo_url("http://odoo:8069", "../etc/passwd");
        assert!(result.is_err());
    }

    #[test]
    fn build_url_rejects_null_byte() {
        let result = build_odoo_url("http://odoo:8069", "path\0sneaky");
        assert!(result.is_err());
    }

    #[test]
    fn build_url_rejects_single_encoded_dot_dot() {
        // %2e%2e after axum decode → .. should be caught
        let result = build_odoo_url("http://odoo:8069", "..%2fetc");
        assert!(result.is_err());
    }

    #[test]
    fn build_url_rejects_double_encoded_dot_dot() {
        // %252e%252e → axum decodes to %2e%2e → full decode yields .. → caught
        let result = build_odoo_url("http://odoo:8069", "%252e%252e%252fetc");
        assert!(result.is_err());
    }

    #[test]
    fn build_url_allows_normal_encoded_path() {
        let result = build_odoo_url("http://odoo:8069", "web%2Fimage%2F123");
        assert!(result.is_ok());
    }

    #[test]
    fn build_url_rejects_invalid_utf8_encoding() {
        // percent_decode of invalid UTF-8 sequence
        let result = build_odoo_url("http://odoo:8069", "%ff%fe");
        assert!(result.is_err());
    }

    #[test]
    fn extract_method_returns_method_name() {
        let body = axum::body::Bytes::from(
            r#"{"jsonrpc":"2.0","params":{"model":"res.partner","method":"search_read"}}"#,
        );
        assert_eq!(extract_method(&body), Some("search_read".into()));
    }

    #[test]
    fn extract_method_missing_params_returns_none() {
        let body = axum::body::Bytes::from(r#"{"jsonrpc":"2.0"}"#);
        assert_eq!(extract_method(&body), None);
    }

    #[test]
    fn extract_method_invalid_json_returns_none() {
        let body = axum::body::Bytes::from("not json");
        assert_eq!(extract_method(&body), None);
    }

    #[test]
    fn try_build_cache_key_readable_method() {
        let body = axum::body::Bytes::from(
            r#"{"params":{"model":"res.partner","method":"search_read","args":[[],["name"]]}}"#,
        );
        let result = try_build_cache_key(&body);
        assert!(result.is_ok());
    }

    #[test]
    fn try_build_cache_key_write_method_rejected() {
        let body = axum::body::Bytes::from(
            r#"{"params":{"model":"res.partner","method":"write","args":[1,{}]}}"#,
        );
        let result = try_build_cache_key(&body);
        assert!(result.is_err());
    }

    #[test]
    fn try_build_cache_key_no_method_fails() {
        let body = axum::body::Bytes::from(r#"{"params":{"model":"res.partner"}}"#);
        let result = try_build_cache_key(&body);
        assert!(result.is_err());
    }

    #[test]
    fn write_methods_binary_search() {
        assert!(WRITE_METHODS.binary_search(&"create").is_ok());
        assert!(WRITE_METHODS.binary_search(&"write").is_ok());
        assert!(WRITE_METHODS.binary_search(&"search_read").is_err());
    }

    #[test]
    fn matches_proxy_header_case_insensitive() {
        assert!(matches_proxy_header("Content-Type"));
        assert!(matches_proxy_header("content-type"));
        assert!(matches_proxy_header("Set-Cookie"));
        assert!(!matches_proxy_header("x-custom"));
    }
}
