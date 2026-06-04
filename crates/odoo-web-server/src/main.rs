//! Odoo Web Server — BFF gateway binary entry point.
//!
//! ## Architecture
//! ```text
//! Browser (oweb) → REST/WS → odoo-web-server :3000 → JSON-RPC → Odoo :8069
//! ```

use axum::extract::{ConnectInfo, Path, Query, State, WebSocketUpgrade};
use axum::http::HeaderMap;
use axum::http::Method;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Json, Router, middleware, routing::get, routing::post};
use clap::Parser;
use odoo_core::config::ServerConfig;
use odoo_core::types::LoginRequest;
use std::net::SocketAddr;
use tokio::sync::broadcast;
use tower_http::compression::CompressionLayer;
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;
use tower_http::trace::TraceLayer;
use tracing::info;

use odoo_web_server::AppState;
use odoo_web_server::csrf::{self, CsrfConfig};
use odoo_web_server::error::AppError;
use odoo_web_server::health;
use odoo_web_server::{menu, proxy, report, session, ws};

#[derive(Parser, Debug)]
#[command(name = "odoo-web-server")]
struct Cli {
    #[arg(long, env = "HOST", default_value = "0.0.0.0")]
    host: String,

    #[arg(long, env = "PORT", default_value_t = 3000)]
    port: u16,

    #[arg(long, env = "ODOO_URL", default_value = "http://localhost:8069")]
    odoo_url: String,

    #[arg(long, env = "ODOO_DB")]
    odoo_db: Option<String>,

    #[arg(long, env = "FRONTEND_DIR", default_value = "../apps/oweb/dist")]
    frontend_dir: String,

    #[arg(
        long,
        env = "ALLOWED_ORIGINS",
        default_value = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    )]
    allowed_origins: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .init();

    info!("Starting odoo-web-server v{}", env!("CARGO_PKG_VERSION"));

    // Parse CLI args, fallback to env vars
    let cli = Cli::parse();
    let config = ServerConfig {
        host: cli.host,
        port: cli.port,
        odoo_url: cli.odoo_url.clone(),
        odoo_db: cli.odoo_db.clone(),
        frontend_dir: cli.frontend_dir.clone(),
        allowed_origins: cli
            .allowed_origins
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect(),
    };

    info!("Odoo URL: {}", config.odoo_url);
    info!("Frontend dir: {}", config.frontend_dir);

    // reqwest client — no cookie_store: cookies are manually forwarded per-request
    // to prevent session leakage between concurrent users.
    let http_client = reqwest::Client::builder()
        .user_agent(concat!("odoo-web-server/", env!("CARGO_PKG_VERSION")))
        .timeout(std::time::Duration::from_secs(30))
        .build()?;

    // WebSocket event broadcast channel
    let (event_tx, _) = broadcast::channel::<serde_json::Value>(256);

    let odoo_url_clean = config.odoo_url.trim_end_matches('/').to_string();
    let state = AppState::new(
        http_client.clone(),
        odoo_url_clean.clone(),
        event_tx.clone(),
    );

    // Spawn Odoo Bus polling task
    tokio::spawn(ws::poll_odoo_bus(http_client, odoo_url_clean, event_tx));

    // Spawn rate limiter cleanup task
    let rate_limiter = state.rate_limiter.clone();
    tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(120)).await;
            rate_limiter.cleanup();
        }
    });

    // Build dynamic CORS origins
    let cors_origins: Vec<axum::http::HeaderValue> = config
        .allowed_origins
        .iter()
        .filter_map(|origin| origin.parse().ok())
        .collect();

    // Build CSRF-protected routes (state-changing endpoints only)
    let csrf_config = CsrfConfig {
        allowed_origins: config.allowed_origins.clone(),
    };
    let csrf_protected = Router::new()
        .route("/api/session/login", post(session_login))
        .route("/api/session/logout", post(session_logout))
        .route("/api/odoo/{*path}", post(proxy_odoo))
        .route(
            "/api/odoo-http/{*path}",
            axum::routing::any(proxy_odoo_http),
        )
        .layer(middleware::from_fn_with_state(
            csrf_config,
            csrf::csrf_guard,
        ));

    // Build router
    let frontend_dir = config.frontend_dir.clone();
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/menu", get(menu_handler))
        .route("/api/menus", get(menus_handler))
        .route("/api/session", get(get_session_info))
        .route("/api/session/languages", get(get_languages))
        .route("/api/session/modules", get(get_modules))
        .route("/api/session/check", get(session_check))
        .route("/api/web/image/{*path}", get(proxy_image))
        .route("/api/logo", get(proxy_logo))
        .route("/api/translations", get(proxy_translations))
        .route("/api/web/content/{*path}", get(proxy_content))
        .route("/api/report/download", get(download_report))
        .route("/api/report/barcode/{*path}", get(proxy_barcode))
        .route("/api/event/{id}/ics", get(proxy_event_ics))
        .route("/ws/events", get(ws_events_handler))
        .merge(csrf_protected)
        .layer(axum::extract::DefaultBodyLimit::max(10 * 1024 * 1024)) // 10 MB
        .fallback_service(ServeDir::new(&frontend_dir).append_index_html_on_directories(true))
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(
            CorsLayer::new()
                .allow_origin(cors_origins)
                .allow_methods([
                    axum::http::Method::GET,
                    axum::http::Method::POST,
                    axum::http::Method::OPTIONS,
                ])
                .allow_headers([
                    axum::http::header::CONTENT_TYPE,
                    axum::http::header::COOKIE,
                    axum::http::header::ACCEPT,
                ])
                .allow_credentials(true),
        )
        .with_state(state);

    let addr = format!("{}:{}", config.host, config.port);
    info!("Listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;

    Ok(())
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("failed to install Ctrl+C handler");
    info!("Shutting down gracefully...");
}

// ── Session endpoints ──────────────────────────────────────────────

async fn get_session_info(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    session::get_session_info(state, headers).await
}

async fn session_login(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(body): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = addr.ip().to_string();
    if !state.rate_limiter.check(&client_ip) {
        return Err(AppError(odoo_core::error::OdooError::Api {
            code: 429,
            message: "Too many login attempts. Try again later.".into(),
            data: None,
        }));
    }
    session::login(state, body).await
}

async fn session_logout(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    session::logout(state, headers).await
}

async fn get_languages(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    session::get_languages(state).await
}

async fn get_modules(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    session::get_modules(state, headers).await
}

// ── JSON-RPC proxy ─────────────────────────────────────────────────

async fn proxy_odoo(
    State(state): State<AppState>,
    Path(path): Path<String>,
    headers: HeaderMap,
    body: axum::body::Bytes,
) -> Result<impl IntoResponse, AppError> {
    proxy::proxy_odoo(state, &path, headers, body).await
}

// ── General HTTP proxy (multipart, GET, form data, etc.) ──────────

async fn proxy_odoo_http(
    State(state): State<AppState>,
    method: Method,
    Path(path): Path<String>,
    headers: HeaderMap,
    query: axum::extract::Query<Vec<(String, String)>>,
    body: axum::body::Bytes,
) -> Result<impl IntoResponse, AppError> {
    let query_str = url::form_urlencoded::Serializer::new(String::new())
        .extend_pairs(query.iter().map(|(k, v)| (k, v)))
        .finish();
    proxy::proxy_odoo_http(
        state,
        method,
        &path,
        headers,
        if query_str.is_empty() {
            None
        } else {
            Some(query_str)
        },
        body,
    )
    .await
}

// ── Image proxy ────────────────────────────────────────────────────

async fn proxy_image(
    State(state): State<AppState>,
    path: axum::extract::Path<String>,
    headers: HeaderMap,
    query: axum::extract::Query<Vec<(String, String)>>,
) -> Result<impl IntoResponse, AppError> {
    let query_str = url::form_urlencoded::Serializer::new(String::new())
        .extend_pairs(query.iter().map(|(k, v)| (k, v)))
        .finish();
    let full_path = if query_str.is_empty() {
        path.0
    } else {
        format!("{}?{}", path.0, query_str)
    };
    proxy::proxy_image(state, axum::extract::Path(full_path), headers).await
}

async fn proxy_logo(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    proxy::proxy_odoo_http(
        state,
        Method::GET,
        "logo",
        headers,
        None,
        axum::body::Bytes::new(),
    )
    .await
}

async fn proxy_translations(
    State(state): State<AppState>,
    headers: HeaderMap,
    query: axum::extract::Query<Vec<(String, String)>>,
) -> Result<impl IntoResponse, AppError> {
    let query_str = query
        .iter()
        .map(|(k, v)| format!("{}={}", k, v))
        .collect::<Vec<_>>()
        .join("&");
    proxy::proxy_odoo_http(
        state,
        Method::GET,
        "web/webclient/translations",
        headers,
        if query_str.is_empty() {
            None
        } else {
            Some(query_str)
        },
        axum::body::Bytes::new(),
    )
    .await
}

async fn proxy_content(
    State(state): State<AppState>,
    path: axum::extract::Path<String>,
    headers: HeaderMap,
    query: axum::extract::Query<Vec<(String, String)>>,
) -> Result<impl IntoResponse, AppError> {
    let query_str = query
        .iter()
        .map(|(k, v)| format!("{}={}", k, v))
        .collect::<Vec<_>>()
        .join("&");
    proxy::proxy_odoo_http(
        state,
        Method::GET,
        &format!("web/content/{}", path.0),
        headers,
        if query_str.is_empty() {
            None
        } else {
            Some(query_str)
        },
        axum::body::Bytes::new(),
    )
    .await
}

async fn session_check(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    session::check(state, headers).await
}

// ── Menu handlers with rate limiting ────────────────────────────────

async fn menu_handler(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = addr.ip().to_string();
    if !state.menu_rate_limiter.check(&client_ip) {
        return Err(AppError(odoo_core::error::OdooError::Api {
            code: 429,
            message: "Too many menu requests. Try again later.".into(),
            data: None,
        }));
    }
    menu::get_menu(State(state)).await
}

async fn menus_handler(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = addr.ip().to_string();
    if !state.menu_rate_limiter.check(&client_ip) {
        return Err(AppError(odoo_core::error::OdooError::Api {
            code: 429,
            message: "Too many menu requests. Try again later.".into(),
            data: None,
        }));
    }
    menu::get_menus(State(state), headers).await
}

// ── Report download proxy ──────────────────────────────────────────

async fn download_report(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    query: axum::extract::Query<report::ReportParams>,
) -> Result<impl IntoResponse, AppError> {
    let client_ip = addr.ip().to_string();
    if !state.report_rate_limiter.check(&client_ip) {
        return Err(AppError(odoo_core::error::OdooError::Api {
            code: 429,
            message: "Too many report downloads. Try again later.".into(),
            data: None,
        }));
    }
    report::download_report(State(state), headers, query).await
}

async fn proxy_barcode(
    state: State<AppState>,
    path: axum::extract::Path<String>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    report::proxy_barcode(state, path, headers).await
}

// ── Event ICS download proxy ────────────────────────────────────────

async fn proxy_event_ics(
    State(state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<u64>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    let path = format!("event/{}/ics", id);
    proxy::proxy_odoo_http(
        state,
        Method::GET,
        &path,
        headers,
        None,
        axum::body::Bytes::new(),
    )
    .await
}

// ── WebSocket events ───────────────────────────────────────────────

async fn ws_events_handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    ws: WebSocketUpgrade,
) -> Result<impl IntoResponse, StatusCode> {
    let cookie = headers
        .get("cookie")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    if !ws::verify_session(&state, cookie).await.unwrap_or(false) {
        return Err(StatusCode::UNAUTHORIZED);
    }

    let state_for_socket = state.clone();
    Ok(ws.on_upgrade(move |socket| ws::handle_ws(socket, state_for_socket.event_tx.subscribe())))
}

// ── Health check ────────────────────────────────────────────────────

async fn health_check(
    State(state): State<AppState>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> impl IntoResponse {
    health::health_check(state, params).await
}
