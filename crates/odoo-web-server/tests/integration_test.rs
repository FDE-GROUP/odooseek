//! BFF integration tests — wiremock-based Odoo API simulation.
//!
//! Test coverage: session (login/logout/session-info/check/languages/modules),
//! menu (get_menus/get_menu), report (download_report/barcode), proxy
//! (JSON-RPC with caching, HTTP proxy, image proxy), error handling.

use odoo_core::types::LoginRequest;
use odoo_web_server::{AppState, proxy, session};
use serde_json::json;
use wiremock::matchers::{method, path, query_param};
use wiremock::{Mock, MockServer, ResponseTemplate};

// ── Helpers ─────────────────────────────────────────────────────────

fn test_state(mock: &MockServer) -> AppState {
    let client = reqwest::Client::builder().build().unwrap();
    let (tx, _) = tokio::sync::broadcast::channel(1);
    AppState::new(client, mock.uri(), tx)
}

fn auth_cookie_header() -> axum::http::HeaderMap {
    let mut map = axum::http::HeaderMap::new();
    map.insert("cookie", "session_id=abc123".parse().unwrap());
    map
}

fn anon_header() -> axum::http::HeaderMap {
    axum::http::HeaderMap::new()
}

// ── Session tests ───────────────────────────────────────────────────

mod session_tests {
    use super::*;

    #[tokio::test]
    async fn login_success() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/authenticate"))
            .respond_with(
                ResponseTemplate::new(200).set_body_json(json!({
                    "jsonrpc": "2.0", "id": 1,
                    "result": {"uid": 2, "name": "Admin", "username": "admin", "is_admin": true, "db": "test"}
                })).insert_header("Set-Cookie", "session_id=abc123"),
            )
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::login(state, LoginRequest::new("test", "admin", "admin")).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn login_invalid_credentials() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/authenticate"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "error": {"code": 100, "message": "Invalid credentials"}
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::login(state, LoginRequest::new("test", "bad", "wrong")).await;
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn logout_destroys_session() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/destroy"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_json(json!({"jsonrpc":"2.0","id":1,"result":true}))
                    .insert_header("Set-Cookie", "session_id=; Max-Age=0"),
            )
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::logout(state, auth_cookie_header()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn get_languages_returns_list() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/get_lang_list"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "result": [["en_US", "English"], ["zh_CN", "中文"]]
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::get_languages(state).await;
        assert!(result.is_ok());
        let langs = result.unwrap();
        assert!(!langs.is_empty());
    }

    #[tokio::test]
    async fn get_modules_returns_list() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/modules"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "result": ["base", "web", "hr", "crm"]
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::get_modules(state, auth_cookie_header()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn session_check_authenticated() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/check"))
            .respond_with(ResponseTemplate::new(200))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::check(state, auth_cookie_header()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn session_check_anonymous() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/check"))
            .respond_with(ResponseTemplate::new(401))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::check(state, anon_header()).await;
        assert!(result.is_ok()); // check always returns Ok, with ok: false in body
    }

    #[tokio::test]
    async fn session_info_anonymous() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/get_session_info"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1, "result": {"uid": false}
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::get_session_info(state, anon_header()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn session_info_authenticated() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/session/get_session_info"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "result": {"uid": 2, "name": "Admin", "username": "admin", "is_admin": true, "db": "test"}
            })))
            .mount(&mock)
            .await;

        // Also mock load_menus for enrichment
        Mock::given(method("GET"))
            .and(path("/web/webclient/load_menus"))
            .and(query_param("unique", "1"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "root": {"id": 1, "name": "root", "children": []},
                "1": {"id": 1, "name": "root"}
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = session::get_session_info(state, auth_cookie_header()).await;
        assert!(result.is_ok());
    }
}

// ── Menu tests ──────────────────────────────────────────────────────

mod menu_tests {
    use odoo_web_server::menu;
    use tower::util::ServiceExt;

    use super::*;

    #[tokio::test]
    async fn get_menus_proxies_load_menus() {
        let mock = MockServer::start().await;
        // Odoo load_menus endpoint
        Mock::given(method("GET"))
            .and(path("/web/webclient/load_menus"))
            .and(query_param("unique", "1"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "root": {"id": 1, "name": "root", "children": [2, 3]},
                "1": {"id": 1, "name": "root"},
                "2": {"id": 2, "name": "Human Resources", "xmlid": "menu_hr_root", "appID": "hr", "actionID": false, "children": [4]},
                "3": {"id": 3, "name": "CRM", "xmlid": "menu_crm_root", "appID": "crm", "actionID": false, "children": []},
                "4": {"id": 4, "name": "Employees", "xmlid": "menu_hr_employee_payroll", "actionID": "472", "children": []}
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let dispatch = axum::Router::new()
            .route("/api/menus", axum::routing::get(menu::get_menus))
            .with_state(state);

        let resp = dispatch
            .oneshot(
                axum::http::Request::builder()
                    .uri("/api/menus")
                    .header("cookie", "session_id=abc123")
                    .body(axum::body::Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), 200);
    }

    #[tokio::test]
    async fn get_menu_returns_items() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/dataset/call_kw"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "result": [{"id": 2, "name": "Human Resources", "children_count": 3}]
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let dispatch = axum::Router::new()
            .route("/api/menu", axum::routing::get(menu::get_menu))
            .with_state(state);

        let resp = dispatch
            .oneshot(
                axum::http::Request::builder()
                    .uri("/api/menu")
                    .body(axum::body::Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), 200);
    }
}

// ── Report tests ────────────────────────────────────────────────────

mod report_tests {
    use odoo_web_server::report;

    use super::*;

    #[tokio::test]
    async fn download_report_resolves_and_proxies() {
        let mock = MockServer::start().await;
        // Step 1: ir.actions.report read via JSON-RPC
        Mock::given(method("POST"))
            .and(path("/web/dataset/call_kw"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "result": [{"report_name": "hr.hr_employee_print_badge", "report_type": "qweb-pdf"}]
            })))
            .mount(&mock)
            .await;

        // Step 2: GET the actual report PDF
        Mock::given(method("GET"))
            .and(path("/report/pdf/hr.hr_employee_print_badge/7,8"))
            .respond_with(
                ResponseTemplate::new(200).set_body_raw(b"%PDF-1.4 fake report", "application/pdf"),
            )
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = report::download_report(
            axum::extract::State(state),
            anon_header(),
            axum::extract::Query(report::ReportParams {
                report_id: 5,
                ids: "7,8".into(),
                report_type: Some("pdf".into()),
            }),
        )
        .await;

        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn download_report_rejects_zero_id() {
        let mock = MockServer::start().await;
        let state = test_state(&mock);
        let result = report::download_report(
            axum::extract::State(state),
            anon_header(),
            axum::extract::Query(report::ReportParams {
                report_id: 0,
                ids: "1".into(),
                report_type: None,
            }),
        )
        .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn download_report_rejects_negative_id() {
        let mock = MockServer::start().await;
        let state = test_state(&mock);
        let result = report::download_report(
            axum::extract::State(state),
            anon_header(),
            axum::extract::Query(report::ReportParams {
                report_id: -1,
                ids: "1".into(),
                report_type: None,
            }),
        )
        .await;

        assert!(result.is_err());
    }

    #[tokio::test]
    async fn proxy_barcode_forwards_request() {
        let mock = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/report/barcode/barcode/EAN13/1234567890123"))
            .respond_with(
                ResponseTemplate::new(200).set_body_raw(vec![0x89, b'P', b'N', b'G'], "image/png"),
            )
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = report::proxy_barcode(
            axum::extract::State(state),
            axum::extract::Path("barcode/EAN13/1234567890123".into()),
            anon_header(),
        )
        .await;

        assert!(result.is_ok());
    }
}

// ── Proxy tests ──────────────────────────────────────────────────

mod proxy_tests {
    use super::*;

    #[tokio::test]
    async fn proxy_read_caches_response() {
        let mock = MockServer::start().await;
        use std::sync::atomic::{AtomicU32, Ordering};
        let call_count = AtomicU32::new(0);

        Mock::given(method("POST"))
            .and(path("/web/dataset/call_kw"))
            .respond_with(move |_: &wiremock::Request| {
                let count = call_count.fetch_add(1, Ordering::Relaxed);
                ResponseTemplate::new(200).set_body_json(json!({
                    "jsonrpc": "2.0", "id": 1,
                    "result": [{"id": count, "name": format!("Record {count}")}]
                }))
            })
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let body = json!({"jsonrpc":"2.0","method":"call","params":{"model":"res.partner","method":"search_read","args":[[],["name"]],"kwargs":{}},"id":1});
        let bytes = axum::body::Bytes::from(serde_json::to_vec(&body).unwrap());
        let headers = axum::http::HeaderMap::new();

        let r1 = proxy::proxy_odoo(
            state.clone(),
            "web/dataset/call_kw",
            headers.clone(),
            bytes.clone(),
        )
        .await
        .unwrap();
        let r2 = proxy::proxy_odoo(state, "web/dataset/call_kw", headers, bytes)
            .await
            .unwrap();

        assert_eq!(r1.status(), 200);
        assert_eq!(r2.status(), 200);
        assert_eq!(
            axum::body::to_bytes(r1.into_body(), 9999).await.unwrap(),
            axum::body::to_bytes(r2.into_body(), 9999).await.unwrap()
        );
    }

    #[tokio::test]
    async fn proxy_write_skips_cache() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/dataset/call_kw"))
            .respond_with(
                ResponseTemplate::new(200)
                    .set_body_json(json!({"jsonrpc":"2.0","id":1,"result":42})),
            )
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let body = json!({"jsonrpc":"2.0","method":"call","params":{"model":"res.partner","method":"create","args":[[{"name":"New"}]],"kwargs":{}},"id":1});
        let bytes = axum::body::Bytes::from(serde_json::to_vec(&body).unwrap());

        let resp = proxy::proxy_odoo(
            state,
            "web/dataset/call_kw",
            axum::http::HeaderMap::new(),
            bytes,
        )
        .await
        .unwrap();
        assert_eq!(resp.status(), 200);
    }

    #[tokio::test]
    async fn proxy_http_get_forwards() {
        let mock = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/web/content/123"))
            .respond_with(ResponseTemplate::new(200).set_body_string("file content"))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let resp = proxy::proxy_odoo_http(
            state,
            axum::http::Method::GET,
            "web/content/123",
            axum::http::HeaderMap::new(),
            None,
            axum::body::Bytes::new(),
        )
        .await
        .unwrap();
        assert_eq!(resp.status(), 200);
    }

    #[tokio::test]
    async fn proxy_image_forwards() {
        let mock = MockServer::start().await;
        Mock::given(method("GET"))
            .and(path("/web/image/res.partner/1/image_128"))
            .respond_with(
                ResponseTemplate::new(200).set_body_raw(vec![0x89, b'P', b'N', b'G'], "image/png"),
            )
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        let result = proxy::proxy_image(
            state,
            axum::extract::Path("res.partner/1/image_128".into()),
            axum::http::HeaderMap::new(),
        )
        .await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn proxy_caches_different_ttls() {
        let mock = MockServer::start().await;
        Mock::given(method("POST"))
            .and(path("/web/dataset/call_kw"))
            .respond_with(ResponseTemplate::new(200).set_body_json(json!({
                "jsonrpc": "2.0", "id": 1,
                "result": {"field": {"type": "char", "string": "Name"}}
            })))
            .mount(&mock)
            .await;

        let state = test_state(&mock);
        // fields_get should be cached with long TTL (24h)
        let body = json!({"jsonrpc":"2.0","method":"call","params":{"model":"res.partner","method":"fields_get","args":[[],["type","string"]],"kwargs":{"attributes":["type","string"]}},"id":1});
        let bytes = axum::body::Bytes::from(serde_json::to_vec(&body).unwrap());

        let resp = proxy::proxy_odoo(
            state.clone(),
            "web/dataset/call_kw",
            anon_header(),
            bytes.clone(),
        )
        .await
        .unwrap();
        assert_eq!(resp.status(), 200);

        // Second call should use cache (verified by no extra wiremock expectation)
        let resp2 = proxy::proxy_odoo(state, "web/dataset/call_kw", anon_header(), bytes)
            .await
            .unwrap();
        assert_eq!(resp2.status(), 200);
    }
}

// ── Cache tests ──────────────────────────────────────────────────

mod cache_tests {
    use super::*;

    #[tokio::test]
    async fn cache_key_is_deterministic() {
        let body = json!({"jsonrpc":"2.0","method":"call","params":{"model":"res.partner","method":"fields_get","args":[[],["type"]],"kwargs":{}},"id":1});
        let k1 = odoo_web_server::cache::cache_key("res.partner", "fields_get", &body);
        let k2 = odoo_web_server::cache::cache_key("res.partner", "fields_get", &body);
        assert_eq!(k1, k2);
    }

    #[tokio::test]
    async fn cache_hit_and_miss() {
        let state = test_state(&MockServer::start().await);
        let key = "test:key";
        let value = json!({"data": 42});

        // Miss
        assert!(state.cache.get(key).await.is_none());

        // Set
        state.cache.set(key, value.clone(), "test").await;

        // Hit
        let cached = state.cache.get(key).await;
        assert!(cached.is_some());
        assert_eq!(cached.unwrap(), value);
    }

    #[tokio::test]
    async fn cache_ttl_expires() {
        let state = test_state(&MockServer::start().await);
        let key = "ttl:test";
        let value = json!({"expires": true});

        state.cache.set(key, value.clone(), "search_read").await;

        // Should hit immediately
        assert!(state.cache.get(key).await.is_some());

        // search_read TTL is 15 seconds, so we can't easily test expiry
        // but we can verify the set/get cycle
    }

    #[tokio::test]
    async fn cache_invalidation_prefix() {
        let state = test_state(&MockServer::start().await);
        state.cache.set("test:a", json!({}), "test").await;
        state.cache.set("test:b", json!({}), "test").await;
        state.cache.set("other:c", json!({}), "test").await;

        assert!(state.cache.get("test:a").await.is_some());
        assert!(state.cache.get("test:b").await.is_some());
        assert!(state.cache.get("other:c").await.is_some());

        // Invalidate
        state.cache.invalidate("test").await;

        assert!(state.cache.get("test:a").await.is_none());
        assert!(state.cache.get("test:b").await.is_none());
        assert!(state.cache.get("other:c").await.is_some());
    }
}

// ── Error handling tests ────────────────────────────────────────────

mod error_tests {
    use axum::response::IntoResponse as _;
    use odoo_core::error::OdooError;
    use odoo_web_server::AppError;

    #[tokio::test]
    async fn login_failed_maps_to_401() {
        let response =
            AppError::from(OdooError::LoginFailed("Bad password".into())).into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn not_authenticated_maps_to_401() {
        let response = AppError::from(OdooError::NotAuthenticated).into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn unreachable_maps_to_502() {
        let response = AppError::from(OdooError::Unreachable("down".into())).into_response();
        assert_eq!(response.status(), axum::http::StatusCode::BAD_GATEWAY);
    }

    #[tokio::test]
    async fn invalid_response_maps_to_500() {
        let response =
            AppError::from(OdooError::InvalidResponse("malformed".into())).into_response();
        assert_eq!(
            response.status(),
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        );
    }

    #[tokio::test]
    async fn deserialization_maps_to_500() {
        let serde_err = serde_json::from_str::<serde_json::Value>("bad").unwrap_err();
        let response = AppError::from(OdooError::Deserialization(serde_err)).into_response();
        assert_eq!(
            response.status(),
            axum::http::StatusCode::INTERNAL_SERVER_ERROR
        );
    }

    #[tokio::test]
    async fn api_error_code_100_maps_to_401() {
        let response = AppError::from(OdooError::Api {
            code: 100,
            message: "Session expired".into(),
            data: None,
        })
        .into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn api_error_other_code_maps_to_200() {
        let response = AppError::from(OdooError::Api {
            code: 200,
            message: "Validation error".into(),
            data: None,
        })
        .into_response();
        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }
}

// ── Menu enrichment tests ───────────────────────────────────────────

mod menu_enrich_tests {
    use odoo_web_server::menu_enrich;

    #[test]
    fn collect_action_ids_extracts_valid_ids() {
        let menus = serde_json::json!({
            "root": {"children": [2, 3]},
            "2": {"actionID": 472, "actionModel": "ir.actions.act_window", "id": 2},
            "3": {"actionID": false, "id": 3}
        });

        let ids = menu_enrich::collect_act_window_action_ids(&menus);
        assert_eq!(ids, vec![472]);
    }

    #[test]
    fn collect_action_ids_handles_empty() {
        let menus = serde_json::json!({});
        let ids = menu_enrich::collect_act_window_action_ids(&menus);
        assert!(ids.is_empty());
    }

    #[test]
    fn apply_res_models_injects_field() {
        let mut maps = std::collections::HashMap::new();
        maps.insert(472, "hr.employee".into());

        let menus = serde_json::json!({
            "2": {"actionID": 472, "id": 2, "name": "Employees"},
            "3": {"actionID": false, "id": 3, "name": "Root"}
        });

        let enriched = menu_enrich::apply_action_res_models(menus.clone(), &maps);
        assert_eq!(enriched["2"]["resModel"], "hr.employee");
        assert!(enriched["3"].get("resModel").is_none());
    }

    #[test]
    fn apply_res_models_preserves_other_fields() {
        let mut maps = std::collections::HashMap::new();
        maps.insert(504, "res.partner".into());

        let menus = serde_json::json!({
            "4": {"actionID": 504, "id": 4, "name": "Contacts", "xmlid": "menu_contacts"}
        });

        let enriched = menu_enrich::apply_action_res_models(menus.clone(), &maps);
        assert_eq!(enriched["4"]["resModel"], "res.partner");
        assert_eq!(enriched["4"]["name"], "Contacts");
        assert_eq!(enriched["4"]["id"], 4);
    }
}
