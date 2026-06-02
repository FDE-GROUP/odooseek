//! Simple rate-limiting middleware for login endpoint.
//!
//! Uses a token bucket algorithm per client IP to prevent brute-force attacks.

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::Instant;

/// Rate limit state shared across requests.
pub struct RateLimiter {
    /// Max requests per window per key.
    max_requests: u32,
    /// Time window in seconds.
    window_secs: u64,
    /// State per key: (remaining_tokens, window_start).
    buckets: Mutex<HashMap<String, (u32, Instant)>>,
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_secs: u64) -> Self {
        Self {
            max_requests,
            window_secs,
            buckets: Mutex::new(HashMap::new()),
        }
    }

    /// Check if request is allowed. Returns true if within limit.
    pub fn check(&self, key: &str) -> bool {
        let mut buckets = self.buckets.lock().unwrap();
        let now = Instant::now();
        let entry = buckets
            .entry(key.to_string())
            .or_insert_with(|| (self.max_requests, now));

        // Reset window if expired
        if now.duration_since(entry.1).as_secs() >= self.window_secs {
            entry.0 = self.max_requests;
            entry.1 = now;
        }

        if entry.0 > 0 {
            entry.0 -= 1;
            true
        } else {
            false
        }
    }

    /// Periodic cleanup of expired entries.
    pub fn cleanup(&self) {
        let mut buckets = self.buckets.lock().unwrap();
        let now = Instant::now();
        buckets.retain(|_, (_, start)| now.duration_since(*start).as_secs() < self.window_secs * 2);
    }
}
