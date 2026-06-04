//! Prometheus metrics middleware and handler.

use axum::extract::Request;
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use metrics::{counter, gauge, histogram};

static HANDLE: std::sync::OnceLock<metrics_exporter_prometheus::PrometheusHandle> =
    std::sync::OnceLock::new();

pub fn init() {
    let handle = metrics_exporter_prometheus::PrometheusBuilder::new()
        .install_recorder()
        .expect("Failed to install Prometheus recorder");
    let _ = HANDLE.set(handle);
    tracing::info!("Prometheus metrics exporter initialized");
}

pub async fn http_metrics(req: Request, next: Next) -> Response {
    let path = req.uri().path().to_owned();
    let method = req.method().clone();

    if path == "/metrics" {
        return next.run(req).await;
    }

    let start = std::time::Instant::now();
    let response = next.run(req).await;
    let elapsed = start.elapsed();

    let status = response.status().as_u16().to_string();

    counter!(
        "http_requests_total",
        "method" => method.to_string(),
        "path" => path.clone(),
        "status" => status
    )
    .increment(1);
    histogram!(
        "http_request_duration_seconds",
        "method" => method.to_string(),
        "path" => path
    )
    .record(elapsed.as_secs_f64());

    response
}

pub async fn metrics_handler() -> impl IntoResponse {
    let body = HANDLE.get().map(|h| h.render()).unwrap_or_default();
    (
        StatusCode::OK,
        [("Content-Type", "text/plain; version=0.0.4; charset=utf-8")],
        body,
    )
}

pub mod labels {
    pub const CACHE_RESULT_HIT: &str = "hit";
    pub const CACHE_RESULT_MISS: &str = "miss";
    pub const CACHE_RESULT_SET: &str = "set";
    pub const CACHE_RESULT_INVALIDATE: &str = "invalidate";
    pub const LOGIN_RESULT_SUCCESS: &str = "success";
    pub const LOGIN_RESULT_FAILURE: &str = "failure";
}

pub fn record_proxy_request(method: &str, cache_result: &str, duration_secs: f64) {
    counter!(
        "odoo_proxy_requests_total",
        "method" => method.to_string(),
        "cache_result" => cache_result.to_string()
    )
    .increment(1);
    histogram!("odoo_proxy_duration_seconds", "method" => method.to_string()).record(duration_secs);
}

pub fn record_cache_operation(operation: &str) {
    counter!("cache_operations_total", "operation" => operation.to_string()).increment(1);
}

pub fn record_login(result: &str) {
    counter!("session_login_total", "result" => result.to_string()).increment(1);
}

pub fn set_ws_active_connections(count: usize) {
    gauge!("ws_active_connections").set(count as f64);
}

pub fn record_ws_broadcast(count: usize) {
    counter!("ws_events_broadcast_total").increment(count as u64);
}

pub fn set_cache_entries(count: usize) {
    gauge!("cache_entries").set(count as f64);
}
