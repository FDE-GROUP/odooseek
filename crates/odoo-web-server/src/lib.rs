//! Odoo Web Server — BFF library
//!
//! This crate provides the core BFF gateway functionality as a library,
//! with the binary entry point in main.rs.

pub mod cache;
pub mod error;
pub mod helpers;
pub mod menu;
pub mod menu_enrich;
pub mod proxy;
pub mod rate_limit;
pub mod report;
pub mod session;
pub mod ws;

pub use cache::ResponseCache;
pub use error::AppError;
pub use rate_limit::RateLimiter;

/// Application shared state
#[derive(Clone)]
pub struct AppState {
    pub http_client: reqwest::Client,
    pub odoo_url: String,
    pub event_tx: tokio::sync::broadcast::Sender<serde_json::Value>,
    pub cache: ResponseCache,
    pub rate_limiter: std::sync::Arc<RateLimiter>,
}

impl AppState {
    pub fn new(
        client: reqwest::Client,
        odoo_url: String,
        tx: tokio::sync::broadcast::Sender<serde_json::Value>,
    ) -> Self {
        Self {
            http_client: client,
            odoo_url,
            event_tx: tx,
            cache: ResponseCache::new(),
            rate_limiter: std::sync::Arc::new(RateLimiter::new(30, 60)), // 30 login attempts per 60s
        }
    }
}
