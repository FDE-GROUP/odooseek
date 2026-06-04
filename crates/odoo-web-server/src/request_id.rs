//! Request tracing — attach X-Request-Id to every request for log correlation.

use axum::extract::Request;
use axum::http::HeaderValue;
use axum::middleware::Next;
use axum::response::Response;

static HEADER: &str = "x-request-id";

pub async fn attach_request_id(mut req: Request, next: Next) -> Response {
    if req.headers().get(HEADER).is_none() {
        let id = generate_id();
        if let Ok(v) = HeaderValue::from_str(&id) {
            req.headers_mut().insert(HEADER, v);
        }
    }

    next.run(req).await
}

fn generate_id() -> String {
    use std::fmt::Write;
    let mut buf = [0u8; 16];
    getrandom::fill(&mut buf).unwrap_or_default();
    let mut s = String::with_capacity(32);
    for byte in &buf {
        write!(s, "{byte:02x}").unwrap();
    }
    s
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generate_id_is_32_hex_chars() {
        let id = generate_id();
        assert_eq!(id.len(), 32);
        assert!(id.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn generate_id_unique() {
        let a = generate_id();
        let b = generate_id();
        assert_ne!(a, b);
    }
}
