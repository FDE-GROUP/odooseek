//! Odoo Web Server — BFF gateway between oweb SPA and Odoo backend.
//!
//! ## Architecture
//! ```text
//! Browser (oweb) → REST/WS → odoo-web-server :3000 → JSON-RPC → Odoo :8069
//! ```

use axum::extract::{Path, State, WebSocketUpgrade};
use axum::http::HeaderMap;
use axum::response::IntoResponse;
use axum::{Json, Router, routing::get, routing::post};
use clap::Parser;
use odoo_core::config::ServerConfig;
use odoo_core::types::LoginRequest;
use tokio::sync::broadcast;
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;
use tracing::info;

mod error;
mod menu;
mod proxy;
mod report;
mod session;
mod ws;

use error::AppError;

/// Application shared state
#[derive(Clone)]
struct AppState {
    /// reqwest HTTP client with cookie_store enabled
    http_client: reqwest::Client,
    /// Odoo base URL
    odoo_url: String,
    /// WebSocket event broadcast sender
    event_tx: broadcast::Sender<serde_json::Value>,
}

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
        log_level: "info".into(),
    };

    info!("Odoo URL: {}", config.odoo_url);
    info!("Frontend dir: {}", config.frontend_dir);

    // reqwest client with cookie store for automatic session management
    let http_client = reqwest::Client::builder()
        .user_agent(concat!("odoo-web-server/", env!("CARGO_PKG_VERSION")))
        .cookie_store(true)
        .timeout(std::time::Duration::from_secs(30))
        .build()?;

    // WebSocket event broadcast channel
    let (event_tx, _) = broadcast::channel::<serde_json::Value>(256);

    let state = AppState {
        http_client: http_client.clone(),
        odoo_url: config.odoo_url.clone(),
        event_tx: event_tx.clone(),
    };

    // Spawn Odoo Bus polling task
    tokio::spawn(ws::poll_odoo_bus(
        http_client,
        config.odoo_url.clone(),
        event_tx,
    ));

    // Build router
    let frontend_dir = config.frontend_dir.clone();
    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/api/menu", get(menu::get_menu))
        .route("/api/menus", get(menu::get_menus))
        .route("/api/session", get(get_session_info))
        .route("/api/session/login", post(session_login))
        .route("/api/session/logout", post(session_logout))
        .route("/api/odoo/{*path}", post(proxy_odoo))
        .route("/api/web/image/{*path}", get(proxy_image))
        .route("/api/report/download", get(download_report))
        .route("/ws/events", get(ws_events_handler))
        .fallback_service(ServeDir::new(&frontend_dir).append_index_html_on_directories(true))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = format!("{}:{}", config.host, config.port);
    info!("Listening on http://{addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app)
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
    Json(body): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    session::login(state, body).await
}

async fn session_logout(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    session::logout(state, headers).await
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

// ── Image proxy ────────────────────────────────────────────────────

async fn proxy_image(
    State(state): State<AppState>,
    path: axum::extract::Path<String>,
    headers: HeaderMap,
) -> Result<impl IntoResponse, AppError> {
    proxy::proxy_image(state, path, headers).await
}

// ── Report download proxy ──────────────────────────────────────────

async fn download_report(
    state: State<AppState>,
    headers: HeaderMap,
    query: axum::extract::Query<report::ReportParams>,
) -> Result<impl IntoResponse, AppError> {
    report::download_report(state, headers, query).await
}

// ── WebSocket events ───────────────────────────────────────────────

async fn ws_events_handler(
    State(state): State<AppState>,
    ws: WebSocketUpgrade,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| ws::handle_ws(socket, state.event_tx.subscribe()))
}
