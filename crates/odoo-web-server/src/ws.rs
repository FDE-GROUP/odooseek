//! WebSocket event bridge — connects to Odoo Bus and broadcasts to browsers.
//!
//! Strategy: Try real WebSocket connection to Odoo first. If it fails (e.g. Odoo
//! behind a proxy that doesn't support WebSocket), fall back to HTTP polling.

use axum::extract::ws::{Message, WebSocket};
use futures::{SinkExt, StreamExt};
use odoo_core::error::OdooError;
use tokio::sync::broadcast;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tracing::{debug, info, warn};

/// Spawn background tasks for Odoo Bus event relay.
/// Tries WebSocket connection first, falls back to HTTP polling.
pub async fn poll_odoo_bus(
    client: reqwest::Client,
    odoo_url: String,
    event_tx: broadcast::Sender<serde_json::Value>,
) {
    let base = odoo_url.trim_end_matches('/');

    // Try real WebSocket first
    match connect_odoo_ws(base, event_tx.clone()).await {
        Ok(()) => {
            info!("Connected to Odoo Bus via WebSocket");
            return;
        }
        Err(e) => {
            warn!("Odoo WebSocket failed ({e}), falling back to HTTP polling");
        }
    }

    // Fallback: HTTP polling
    let bus_url = format!("{}/websocket/peek_notifications", base);
    let mut last: i64 = 0;
    let mut first_poll = true;

    loop {
        tokio::time::sleep(std::time::Duration::from_secs(5)).await;

        let payload = serde_json::json!({
            "jsonrpc": "2.0",
            "method": "call",
            "params": {
                "channels": [],
                "last": last,
                "is_first_poll": first_poll,
            },
            "id": 1,
        });
        first_poll = false;

        let response = match client.post(&bus_url).json(&payload).send().await {
            Ok(r) => r,
            Err(e) => {
                warn!("Odoo Bus poll failed: {e}");
                continue;
            }
        };

        let body: serde_json::Value = match response.json().await {
            Ok(b) => b,
            Err(e) => {
                warn!("Failed to parse Odoo Bus response: {e}");
                continue;
            }
        };

        if let Some(notifications) = body
            .get("result")
            .and_then(|r| r.get("notifications"))
            .and_then(|n| n.as_array())
            && !notifications.is_empty()
        {
            debug!(
                "Broadcasting {} Odoo Bus notification(s)",
                notifications.len()
            );
            last = max_notification_id(notifications).unwrap_or(last);
            crate::metrics::record_ws_broadcast(notifications.len());
            for n in notifications {
                let _ = event_tx.send(n.clone());
            }
        }
    }
}

/// Build WebSocket URL from an HTTP base URL.
fn build_ws_url(base: &str) -> String {
    let ws = if base.starts_with("https://") {
        base.replace("https://", "wss://")
    } else if base.starts_with("http://") {
        base.replace("http://", "ws://")
    } else {
        format!("ws://{}", base)
    };
    format!("{}/websocket", ws)
}

/// Extract the max notification ID from a batch of notifications.
fn max_notification_id(notifications: &[serde_json::Value]) -> Option<i64> {
    notifications
        .iter()
        .filter_map(|n| n.get("id").and_then(|id| id.as_i64()))
        .max()
}

/// Attempt to connect to Odoo's `/websocket` endpoint using tokio-tungstenite.
/// On success, reads frames and broadcasts them via the event_tx channel.
async fn connect_odoo_ws(
    base: &str,
    event_tx: broadcast::Sender<serde_json::Value>,
) -> Result<(), String> {
    let ws_url = build_ws_url(base);
    info!("Connecting to Odoo WebSocket at {ws_url}");

    // Build WebSocket request with proper upgrade headers, then add Origin
    let mut request = ws_url
        .into_client_request()
        .map_err(|e| format!("Failed to build WS request: {e}"))?;
    request.headers_mut().insert(
        http::header::ORIGIN,
        base.parse()
            .map_err(|e| format!("Invalid Origin header: {e}"))?,
    );

    let (ws_stream, _) = tokio_tungstenite::connect_async(request)
        .await
        .map_err(|e| format!("WS connection failed: {e}"))?;

    info!("Odoo WebSocket connected");
    let (mut write, mut read) = ws_stream.split();

    // Send periodic ping to keep connection alive through proxies/LBs
    let keepalive = tokio::spawn(async move {
        loop {
            tokio::time::sleep(std::time::Duration::from_secs(30)).await;
            if write
                .send(tokio_tungstenite::tungstenite::Message::Ping(vec![]))
                .await
                .is_err()
            {
                break;
            }
        }
    });

    while let Some(msg) = read.next().await {
        match msg {
            Ok(tokio_tungstenite::tungstenite::Message::Text(text)) => {
                if let Ok(event) = serde_json::from_str::<serde_json::Value>(&text) {
                    crate::metrics::record_ws_broadcast(1);
                    let _ = event_tx.send(event);
                }
            }
            Ok(tokio_tungstenite::tungstenite::Message::Close(_)) => {
                warn!("Odoo WebSocket closed, will reconnect");
                break;
            }
            Err(e) => {
                warn!("Odoo WebSocket error: {e}, reconnecting...");
                break;
            }
            _ => {}
        }
    }

    keepalive.abort();
    tokio::time::sleep(std::time::Duration::from_secs(5)).await;
    Err("Disconnected - will retry".into())
}

/// Verify session cookie before allowing WebSocket upgrade.
pub async fn verify_session(
    state: &crate::AppState,
    cookie: &str,
) -> Result<bool, crate::error::AppError> {
    let odoo_url = format!("{}/web/session/check", state.odoo_url);
    let request = serde_json::json!({
        "jsonrpc": "2.0",
        "method": "call",
        "params": {},
        "id": 1,
    });

    let resp = state
        .http_client
        .post(&odoo_url)
        .json(&request)
        .header("cookie", cookie)
        .send()
        .await
        .map_err(|e| {
            crate::error::AppError(OdooError::Unreachable(format!("Session check failed: {e}")))
        })?;

    Ok(resp.status().is_success())
}

/// WebSocket handler — subscribes to event broadcast and pushes to browser
pub async fn handle_ws(mut socket: WebSocket, mut rx: broadcast::Receiver<serde_json::Value>) {
    use std::sync::atomic::{AtomicI64, Ordering};
    static ACTIVE: AtomicI64 = AtomicI64::new(0);
    let prev = ACTIVE.fetch_add(1, Ordering::Relaxed);
    crate::metrics::set_ws_active_connections((prev + 1) as usize);

    loop {
        tokio::select! {
            msg = rx.recv() => {
                match msg {
                    Ok(event) => {
                        let text = serde_json::to_string(&event).unwrap_or_default();
                        if let Err(e) = socket.send(Message::Text(text.into())).await {
                            warn!("WebSocket send error: {e}");
                            break;
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(n)) => {
                        warn!("WebSocket client lagged by {n} messages");
                        continue;
                    }
                    Err(broadcast::error::RecvError::Closed) => {
                        break;
                    }
                }
            }
            msg = socket.next() => {
                match msg {
                    Some(Ok(Message::Close(_))) | None => break,
                    Some(Err(e)) => {
                        warn!("WebSocket recv error: {e}");
                        break;
                    }
                    _ => {}
                }
            }
        }
    }

    let prev = ACTIVE.fetch_sub(1, Ordering::Relaxed);
    crate::metrics::set_ws_active_connections((prev - 1) as usize);
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn build_ws_url_from_http() {
        let url = build_ws_url("http://localhost:8069");
        assert_eq!(url, "ws://localhost:8069/websocket");
    }

    #[test]
    fn build_ws_url_from_https() {
        let url = build_ws_url("https://example.com");
        assert_eq!(url, "wss://example.com/websocket");
    }

    #[test]
    fn build_ws_url_no_scheme() {
        let url = build_ws_url("odoo:8069");
        assert_eq!(url, "ws://odoo:8069/websocket");
    }

    #[test]
    fn build_ws_url_trailing_slash() {
        // trim_end_matches('/') is called in poll_odoo_bus before build_ws_url
        let base = "http://localhost:8069/".trim_end_matches('/');
        let url = build_ws_url(base);
        assert_eq!(url, "ws://localhost:8069/websocket");
    }

    #[test]
    fn max_notification_id_finds_max() {
        let notifications = vec![
            json!({"id": 5, "message": "a"}),
            json!({"id": 10, "message": "b"}),
            json!({"id": 3, "message": "c"}),
        ];
        assert_eq!(max_notification_id(&notifications), Some(10));
    }

    #[test]
    fn max_notification_id_missing_id_field() {
        let notifications = vec![
            json!({"id": 1}),
            json!({"message": "no id"}),
            json!({"id": 2}),
        ];
        assert_eq!(max_notification_id(&notifications), Some(2));
    }

    #[test]
    fn max_notification_id_empty_array() {
        let notifications: Vec<serde_json::Value> = vec![];
        assert_eq!(max_notification_id(&notifications), None);
    }

    #[test]
    fn max_notification_id_null_ids() {
        let notifications = vec![json!({"id": null}), json!({"id": 7})];
        assert_eq!(max_notification_id(&notifications), Some(7));
    }
}
