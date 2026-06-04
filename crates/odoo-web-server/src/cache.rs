//! Cache abstraction layer for the BFF proxy.
//!
//! Provides a `CacheStore` trait with two implementations:
//! - `InMemoryCache`: process-local HashMap (default)
//! - `RedisCache`: shared Redis-backed cache (behind `redis-cache` feature)

use async_trait::async_trait;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use tokio::sync::RwLock;
use tokio::time::{Duration, Instant};

// ── Trait ───────────────────────────────────────────────────────────

#[async_trait]
pub trait CacheStore: Send + Sync {
    async fn get(&self, key: &str) -> Option<Value>;
    async fn set(&self, key: &str, value: Value, endpoint_hint: &str);
    async fn invalidate(&self, prefix: &str);
    async fn entry_count(&self) -> usize;
    async fn stats(&self) -> CacheStats;
    async fn clear(&self);
}

#[derive(Clone, serde::Serialize)]
pub struct CacheStats {
    pub entries: usize,
    pub hits: u64,
    pub misses: u64,
    pub sets: u64,
    pub invalidations: u64,
    pub hit_rate: f64,
}

// ── InMemory ────────────────────────────────────────────────────────

struct CacheEntry {
    value: Value,
    expires_at: Instant,
}

#[derive(Clone)]
pub struct InMemoryCache {
    inner: Arc<RwLock<HashMap<String, CacheEntry>>>,
    max_entries: usize,
    hits: Arc<AtomicU64>,
    misses: Arc<AtomicU64>,
    sets: Arc<AtomicU64>,
    invalidations: Arc<AtomicU64>,
}

impl InMemoryCache {
    const DEFAULT_MAX_ENTRIES: usize = 5000;

    pub fn new() -> Self {
        let cache = Self {
            inner: Arc::new(RwLock::new(HashMap::new())),
            max_entries: Self::DEFAULT_MAX_ENTRIES,
            hits: Arc::new(AtomicU64::new(0)),
            misses: Arc::new(AtomicU64::new(0)),
            sets: Arc::new(AtomicU64::new(0)),
            invalidations: Arc::new(AtomicU64::new(0)),
        };
        let inner = cache.inner.clone();
        tokio::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_secs(60)).await;
                let now = Instant::now();
                inner.write().await.retain(|_, v| v.expires_at > now);
            }
        });
        cache
    }
}

impl Default for InMemoryCache {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl CacheStore for InMemoryCache {
    async fn get(&self, key: &str) -> Option<Value> {
        let cache = self.inner.read().await;
        let result = cache.get(key).and_then(|entry| {
            if entry.expires_at > Instant::now() {
                Some(entry.value.clone())
            } else {
                None
            }
        });
        if result.is_some() {
            self.hits.fetch_add(1, Ordering::Relaxed);
            crate::metrics::record_cache_operation(crate::metrics::labels::CACHE_RESULT_HIT);
        } else {
            self.misses.fetch_add(1, Ordering::Relaxed);
            crate::metrics::record_cache_operation(crate::metrics::labels::CACHE_RESULT_MISS);
        }
        crate::metrics::set_cache_entries(cache.len());
        result
    }

    async fn set(&self, key: &str, value: Value, endpoint_hint: &str) {
        let ttl = ttl_for_endpoint(endpoint_hint);
        let entry = CacheEntry {
            value,
            expires_at: Instant::now() + ttl,
        };
        let mut cache = self.inner.write().await;
        cache.insert(key.to_string(), entry);

        if cache.len() > self.max_entries
            && let Some(oldest_key) = cache
                .iter()
                .min_by_key(|(_, e)| e.expires_at)
                .map(|(k, _)| k.clone())
        {
            cache.remove(&oldest_key);
        }
        self.sets.fetch_add(1, Ordering::Relaxed);
        crate::metrics::record_cache_operation(crate::metrics::labels::CACHE_RESULT_SET);
        crate::metrics::set_cache_entries(cache.len());
    }

    async fn invalidate(&self, prefix: &str) {
        self.inner
            .write()
            .await
            .retain(|k, _| !k.starts_with(prefix));
        self.invalidations.fetch_add(1, Ordering::Relaxed);
        crate::metrics::record_cache_operation(crate::metrics::labels::CACHE_RESULT_INVALIDATE);
    }

    async fn entry_count(&self) -> usize {
        self.inner.read().await.len()
    }

    async fn stats(&self) -> CacheStats {
        let entries = self.inner.read().await.len();
        let hits = self.hits.load(Ordering::Relaxed);
        let misses = self.misses.load(Ordering::Relaxed);
        let total = hits + misses;
        let hit_rate = if total > 0 {
            hits as f64 / total as f64
        } else {
            0.0
        };
        CacheStats {
            entries,
            hits,
            misses,
            sets: self.sets.load(Ordering::Relaxed),
            invalidations: self.invalidations.load(Ordering::Relaxed),
            hit_rate,
        }
    }

    async fn clear(&self) {
        self.inner.write().await.clear();
    }
}

// ── Redis ───────────────────────────────────────────────────────────

#[cfg(feature = "redis-cache")]
pub mod redis_impl {
    use super::*;
    use ::redis::AsyncCommands;

    #[derive(Clone)]
    pub struct RedisCache {
        client: ::redis::Client,
        key_prefix: String,
    }

    impl RedisCache {
        pub fn new(redis_url: &str, key_prefix: &str) -> Result<Self, ::redis::RedisError> {
            let client = ::redis::Client::open(redis_url)?;
            Ok(Self {
                client,
                key_prefix: key_prefix.to_string(),
            })
        }

        fn prefixed_key(&self, key: &str) -> String {
            format!("{}:{}", self.key_prefix, key)
        }
    }

    #[async_trait]
    impl CacheStore for RedisCache {
        async fn get(&self, key: &str) -> Option<Value> {
            let mut conn = self.client.get_multiplexed_async_connection().await.ok()?;
            let data: Option<String> = conn.get(self.prefixed_key(key)).await.ok()?;
            data.and_then(|s| serde_json::from_str(&s).ok())
        }

        async fn set(&self, key: &str, value: Value, endpoint_hint: &str) {
            let Ok(mut conn) = self.client.get_multiplexed_async_connection().await else {
                return;
            };
            let ttl = ttl_for_endpoint(endpoint_hint);
            let prefixed = self.prefixed_key(key);
            let _ = conn
                .set_ex::<_, _, ()>(&prefixed, value.to_string(), ttl.as_secs())
                .await;
        }

        async fn invalidate(&self, prefix: &str) {
            let Ok(mut conn) = self.client.get_multiplexed_async_connection().await else {
                return;
            };
            let pattern = format!("{}*", self.prefixed_key(prefix));
            let mut cursor: u64 = 0;
            loop {
                let (new_cursor, keys): (u64, Vec<String>) = ::redis::cmd("SCAN")
                    .arg(cursor)
                    .arg("MATCH")
                    .arg(&pattern)
                    .arg("COUNT")
                    .arg(100)
                    .query_async(&mut conn)
                    .await
                    .unwrap_or((0, vec![]));
                if !keys.is_empty() {
                    let _ = conn.del::<_, ()>(&keys).await;
                }
                cursor = new_cursor;
                if cursor == 0 {
                    break;
                }
            }
        }

        async fn entry_count(&self) -> usize {
            let Ok(mut conn) = self.client.get_multiplexed_async_connection().await else {
                return 0;
            };
            let Ok(count) = ::redis::cmd("DBSIZE").query_async::<i64>(&mut conn).await else {
                return 0;
            };
            count as usize
        }

        async fn stats(&self) -> CacheStats {
            let entries = self.entry_count().await;
            CacheStats {
                entries,
                hits: 0,
                misses: 0,
                sets: 0,
                invalidations: 0,
                hit_rate: 0.0,
            }
        }

        async fn clear(&self) {
            let Ok(mut conn) = self.client.get_multiplexed_async_connection().await else {
                return;
            };
            let _: () = ::redis::cmd("FLUSHDB")
                .query_async(&mut conn)
                .await
                .unwrap_or(());
        }
    }
}

// ── Helpers ─────────────────────────────────────────────────────────

pub fn cache_key(model: &str, method: &str, args: &Value) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut h = DefaultHasher::new();
    model.hash(&mut h);
    method.hash(&mut h);
    args.hash(&mut h);
    let hash = h.finish();
    format!("{model}:{method}:{hash:x}")
}

fn ttl_for_endpoint(method: &str) -> Duration {
    match method {
        "fields_get" => Duration::from_secs(86_400),
        "get_views" => Duration::from_secs(3_600),
        "default_get" => Duration::from_secs(3_600),
        "name_search" | "web_name_search" => Duration::from_secs(300),
        "read" | "search_read" => Duration::from_secs(15),
        m if m.starts_with("search_panel_select") => Duration::from_secs(30),
        _ => Duration::from_secs(60),
    }
}

// ── Type alias for ergonomic usage ──────────────────────────────────

pub type Cache = Arc<dyn CacheStore>;

pub fn default_cache() -> Cache {
    Arc::new(InMemoryCache::new())
}

#[cfg(feature = "redis-cache")]
pub fn redis_cache(redis_url: &str, key_prefix: &str) -> Result<Cache, ::redis::RedisError> {
    Ok(Arc::new(redis_impl::RedisCache::new(
        redis_url, key_prefix,
    )?))
}

// ── Tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn cache_key_deterministic() {
        let args1 = json!([[], ["name"]]);
        let args2 = json!([[], ["name"]]);
        let k1 = cache_key("model", "search_read", &args1);
        let k2 = cache_key("model", "search_read", &args2);
        assert_eq!(k1, k2);
    }

    #[test]
    fn cache_key_different_models() {
        let args = json!([[], ["name"]]);
        let k1 = cache_key("res.partner", "search_read", &args);
        let k2 = cache_key("res.users", "search_read", &args);
        assert_ne!(k1, k2);
    }

    #[test]
    fn cache_key_different_methods() {
        let args = json!([[], ["name"]]);
        let k1 = cache_key("model", "search_read", &args);
        let k2 = cache_key("model", "fields_get", &args);
        assert_ne!(k1, k2);
    }

    #[test]
    fn ttl_fields_get_is_24h() {
        assert_eq!(ttl_for_endpoint("fields_get"), Duration::from_secs(86_400));
    }

    #[test]
    fn ttl_search_panel_prefix_match() {
        assert_eq!(
            ttl_for_endpoint("search_panel_select_range"),
            Duration::from_secs(30)
        );
        assert_eq!(
            ttl_for_endpoint("search_panel_select_multi_range"),
            Duration::from_secs(30)
        );
    }

    #[test]
    fn ttl_unknown_falls_to_60s() {
        assert_eq!(ttl_for_endpoint("unknown"), Duration::from_secs(60));
    }

    #[test]
    fn ttl_default_get_is_1h() {
        assert_eq!(ttl_for_endpoint("default_get"), Duration::from_secs(3_600));
    }

    #[tokio::test]
    async fn in_memory_hit_and_miss() {
        let cache = InMemoryCache::new();
        assert!(cache.get("key1").await.is_none());
        cache.set("key1", json!({"a": 1}), "test").await;
        let v = cache.get("key1").await;
        assert!(v.is_some());
        assert_eq!(v.unwrap(), json!({"a": 1}));
    }

    #[tokio::test]
    async fn in_memory_invalidate_prefix() {
        let cache = InMemoryCache::new();
        cache.set("test:a", json!({}), "test").await;
        cache.set("test:b", json!({}), "test").await;
        cache.set("other:c", json!({}), "test").await;
        cache.invalidate("test").await;
        assert!(cache.get("test:a").await.is_none());
        assert!(cache.get("test:b").await.is_none());
        assert!(cache.get("other:c").await.is_some());
    }

    #[tokio::test]
    async fn in_memory_entry_count() {
        let cache = InMemoryCache::new();
        assert_eq!(cache.entry_count().await, 0);
        cache.set("k1", json!(1), "test").await;
        cache.set("k2", json!(2), "test").await;
        assert_eq!(cache.entry_count().await, 2);
    }

    #[tokio::test]
    async fn trait_object_works() {
        let cache: Cache = default_cache();
        assert!(cache.get("missing").await.is_none());
        cache.set("present", json!(42), "test").await;
        assert_eq!(cache.get("present").await, Some(json!(42)));
    }
}
