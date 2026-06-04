# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-06-05

### Added

- **Prometheus /metrics endpoint (O1)**: 10 runtime metrics covering HTTP requests, proxy latency, cache operations, WebSocket connections, and login events
- **Redis cache backend (O2)**: `CacheStore` trait with InMemoryCache and RedisCache implementations; switch via `--cache-type` CLI flag
- **E2E automated CI (O3)**: `e2e-smoke` job on PR + full E2E on main push
- **Biome rules tightened (O4)**: Security and quality rules enabled as `warn`; a11y rules enabled after fixing 100 violations
- **OpenAPI 3.0 documentation (O5)**: Swagger UI at `/docs` + `/openapi.json` via utoipa
- **WebSocket auto-reconnect (O6)**: Backend WS reconnect loop + HTTP dual-channel polling + frontend exponential backoff
- **Request tracing (O9)**: `X-Request-Id` middleware for log correlation across BFF → Odoo
- **Cache management API (O10)**: `GET /api/admin/cache/stats` + `POST /api/admin/cache/clear`
- **Integration test expansion (O11)**: 8 test files (cache, error, health, menu, proxy, report, session, ws) with common mock helpers
- **Bundle analysis CI (O12)**: `rollup-plugin-visualizer` integrated in CI pipeline
- **Storybook 10 (O13)**: 8 component/widget stories
- **O2M sub-form validation (#321)**: Missing field detection and inline error display for one2many sub-forms
- **Fleet + Maintenance + HR Holidays module alignment (#322)**: Routes, menu navigation, and model definitions
- **CRM PLS widget tests + E2E (#278)**: Predictive lead scoring widget coverage and CRM end-to-end spec
- **72 TypeScript build errors fixed (#324)**: DomainNode recursive type, module-routes optional prefix, widget generics
- **7 Biome lint errors fixed (#325)**: organizeImports + noShadowRestrictedNames

### Changed

- a11y Biome rules: 6 rules from `off` to `warn` after fixing 100 violations (noSvgWithoutTitle, noStaticElementInteractions, noAutofocus, useKeyWithClickEvents, noLabelWithoutControl, useAltText)
- Rust BFF source: 14 → 17 modules (new: `docs.rs`, `metrics.rs`, `request_id.rs`)
- Integration tests: 1 file (863 lines) → 8 files (805 lines + common helpers)
- Frontend tests: 704 cases (was 701)
- Rust tests: 125 passed

### Removed

- 268 storybook-static build artifacts removed from git tracking (-108K lines)

## [0.1.0] - 2026-05-28

### Added

- Initial release: Rust BFF (axum 0.8) + React 19 SPA frontend
- 8 view types: List, Form, Kanban, Graph, Pivot, Calendar, Activity, Hierarchy
- XML view parser (~1046 lines, framework-independent)
- 17+ business module routes (CRM, Sales, Purchase, Inventory, HR, etc.)
- 35+ field widgets
- 33 shared components
- Security: CSRF, rate limiting, path traversal protection, XSS (DOMPurify), credential redaction
- WebSocket event bridge
- Docker Compose deployment (Odoo + PostgreSQL + BFF + pgAdmin)
- GitHub Actions CI (Rust stable/beta/nightly + frontend)
