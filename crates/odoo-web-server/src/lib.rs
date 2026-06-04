//! Odoo Web Server — BFF library
//!
//! This crate provides the core BFF gateway functionality as a library,
//! with the binary entry point in main.rs.

pub mod cache;
pub mod csrf;
pub mod error;
pub mod health;
pub mod helpers;
pub mod menu;
pub mod menu_enrich;
pub mod metrics;
pub mod proxy;
pub mod rate_limit;
pub mod report;
pub mod request_id;
pub mod session;
pub mod ws;

pub use cache::{Cache, CacheStore, InMemoryCache};
pub use error::AppError;
pub use rate_limit::RateLimiter;

/// Application shared state
///
/// Fields accessed by the binary crate via State extractor.
#[derive(Clone)]
#[allow(dead_code)]
pub struct AppState {
    pub http_client: reqwest::Client,
    pub odoo_url: String,
    pub event_tx: tokio::sync::broadcast::Sender<serde_json::Value>,
    pub cache: Cache,
    pub rate_limiter: std::sync::Arc<RateLimiter>,
    pub report_rate_limiter: std::sync::Arc<RateLimiter>,
    pub menu_rate_limiter: std::sync::Arc<RateLimiter>,
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
            cache: cache::default_cache(),
            rate_limiter: std::sync::Arc::new(RateLimiter::new(30, 60)),
            report_rate_limiter: std::sync::Arc::new(RateLimiter::new(10, 60)),
            menu_rate_limiter: std::sync::Arc::new(RateLimiter::new(30, 60)),
        }
    }

    pub fn with_cache(mut self, cache: Cache) -> Self {
        self.cache = cache;
        self
    }
}
