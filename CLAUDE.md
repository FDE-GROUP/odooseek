# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OdooSeek is a modern frontend replacement for Odoo 19 CE. It keeps Odoo's metadata-driven architecture and business logic but replaces the frontend rendering layer and communication middleware. The stack is React 19 + TypeScript 6 + Rust (axum).

```
oweb (React SPA :5173)
    │
    ├── REST / WebSocket ──→ odoo-web-server (Rust axum :3000)
    │                         ├── API proxy (JSON-RPC passthrough)
    │                         ├── Session proxy & validation
    │                         ├── WebSocket event bridge
    │                         └── Static file serve
    │                                   │
    │                    JSON-RPC ──→  Odoo 19.0 CE (:8069)
    │
    └── /web/content/* ──→ Odoo 19.0 (attachments/images)
```

## Important Convention: Docs & Issues First

**New features must have a corresponding design doc and GitHub Issue before coding.** Write design decisions in local `docs/` (gitignored, never push), then check/create an Issue on [FDE-GROUP/odooseek](https://github.com/FDE-GROUP/odooseek). This does NOT apply to tests or bug fixes.

## Development Workflow

- **Repository**: [FDE-GROUP/odooseek](https://github.com/FDE-GROUP/odooseek) — sole repo for Issues and PRs
- **GitHub Flow**: main ← PR ← feature-branch; PR body references issues with `closes #N`
- **Branch naming**: `feat/N-desc`, `fix/N-desc`, `refactor/N-desc`, `docs/N-desc`, `test/N-desc`, `perf/N-desc`
- **Commit format**: `type: description (refs #N)` — types: feat, fix, docs, refactor, test, perf, chore
- **PR format**: title uses `(refs #N)`, body contains `closes #N`
- **Documentation language**: Chinese (中文)
- **Keep main green**: main must always build and pass all tests

## Commands

### Quick reference (from repo root)

```bash
# Dev servers (two terminals)
bun run dev           # Rust BFF on :3000
bun run oweb:dev      # Frontend HMR on :5173

# Odoo backend
bun run docker:up     # Start Odoo + PostgreSQL
bun run docker:down   # Stop

# Full CI pre-check (run before committing)
bun run precommit     # format + lint + build + test (frontend + backend)

# Frontend only
cd apps/oweb
bun run build         # tsc -b && vite build (type-check + build)
bun run test          # Vitest single run
bun run test:watch    # Vitest watch mode
bun run lint          # Biome check
bun run format        # Biome format --write

# Frontend single test file
cd apps/oweb && bun --bun node_modules/.bin/vitest run src/views/__tests__/OdooListRenderer.test.tsx

# Backend only
cargo build --workspace
cargo test --workspace -- --test-threads=1
cargo clippy --all-targets --no-deps
cargo fmt --check --all

# Shared odoo-client package tests
cd packages/odoo-client && bun run test
```

### E2E tests (Playwright)

Requires Odoo + BFF running; Playwright auto-starts Vite.

```bash
cd apps/oweb
cp e2e/.env.example e2e/.env.local   # configure E2E_DB, E2E_LOGIN, E2E_PASSWORD
bun run e2e:install                   # first time: install Chromium
bun run e2e
```

### Mandatory pre-commit checks

All of these must pass before committing:

**Frontend (apps/oweb):**
```bash
bun run build && bun run lint && bun run test
```

**Backend (crates/):**
```bash
RUSTFLAGS="-D warnings" cargo fmt --check --all
RUSTFLAGS="-D warnings" cargo clippy --all-targets --no-deps
RUSTFLAGS="-D warnings" cargo build --workspace
RUSTFLAGS="-D warnings" cargo test --workspace -- --test-threads=1
```

## Architecture

### Monorepo layout

```
odooseek/
├── apps/oweb/                  # React SPA (Vite + TanStack Router/Query)
│   ├── src/
│   │   ├── routes/             # File-based routing (TanStack Router)
│   │   ├── components/         # Shared UI (Navbar, Dialog, ControlPanel, SearchBar, etc.)
│   │   ├── views/              # Odoo view rendering engine (core of the app)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # API SDK glue, icons, i18n, domain helpers
│   │   ├── themes/             # Runtime theme engine (5 presets + 8 accent colors)
│   │   └── types/              # Shared TypeScript types
│   └── e2e/                    # Playwright E2E tests
│
├── packages/
│   ├── odoo-client/            # Framework-agnostic Odoo JSON-RPC client + XML view parser
│   ├── odoo-types/             # Shared TypeScript type definitions
│   └── odoo-codegen/           # Code generation tools
│
├── crates/
│   ├── odoo-web-server/        # Rust BFF gateway (axum) — the main binary
│   │   └── src/                # proxy, session, ws (WebSocket bridge), menu, csrf, metrics
│   └── odoo-core/              # Shared Rust types & config
│
└── docker/                     # Docker Compose (Odoo 19 CE + PostgreSQL 16)
```

### View engine (apps/oweb/src/views/)

The view engine is the architectural core. It renders Odoo views from XML metadata:

1. **OdooViewLoader** — Fetches view XML via `@odooseek/odoo-client`, parses it, and manages view state (search, pagination, filters). Lazy-loads each renderer.
2. **OdooViewSwitcher** — Tabs for switching between list/kanban/graph/pivot/calendar/activity views.
3. **Renderers** (`OdooListRenderer`, `OdooFormRenderer`, `OdooKanbanRenderer`, `OdooGraphRenderer`, `OdooPivotRenderer`, `OdooActivityRenderer`, `OdooHierarchyRenderer`) — Each receives parsed XML + field metadata and renders the corresponding Odoo view type.
4. **Sub-directories** (`form/`, `list/`, `kanban/`, `calendar/`, `widgets/`) — Shared layout helpers and widget implementations for each view type.

Key data flow: `Odoo XML → odoo-client/xml-parser.ts → parsed types → Renderer → React components + widgets`

### @odooseek/odoo-client (packages/odoo-client/)

Framework-agnostic package consumed by the SPA. Key modules:
- **api.ts** — JSON-RPC calls (`callKw`, `searchRead`, `read`, `fieldsGet`, `callButton`, `loadAction`, etc.)
- **xml-parser.ts** — Parses all Odoo view XML types (list, form, kanban, graph, pivot, calendar, search, hierarchy, activity)
- **expression-evaluator.ts** — Evaluates Odoo domains and modifiers (`attrs`, `invisible`, `readonly`, `required`)
- **menu-service.ts** — Fetches and transforms Odoo `ir.ui.menu` into tree structure
- **types.ts** — All shared type definitions for fields, parsed views, etc.
- **validation.ts** — Field-level validation for form submissions
- **typed-api.ts** — Typed wrappers for ORM operations (read, write, create, unlink, defaultGet)

### Rust BFF (crates/odoo-web-server/)

Sits between the browser and Odoo, handling:
- **proxy.rs** — JSON-RPC passthrough to Odoo
- **session.rs** — Login/logout, session cookie management
- **ws.rs** — Odoo Bus → WebSocket event bridge for real-time updates
- **menu.rs / menu_enrich.rs** — Menu API with enrichment
- **csrf.rs** — CSRF protection
- **report.rs** — Report generation proxy
- **metrics.rs** — Prometheus metrics
- Config via CLI args/env vars: `HOST`, `PORT`, `ODOO_URL`, `ODOO_DB`, `FRONTEND_DIR`, `ALLOWED_ORIGINS`, `REDIS_URL`

### Path aliases

- `@/` → `apps/oweb/src/` (configured in vitest.config.ts and vite.config.ts)
- `@odooseek/odoo-client` → `packages/odoo-client/src/` (file: dependency)

### Linting & formatting

- **Frontend**: Biome (single quotes, no semicolons, 2-space indent, 100 char line width) — config in `biome.json`
- **Backend**: rustfmt + clippy — config in `clippy.toml` (complexity threshold 30, max 8 args, max 150 lines)
- Rust edition 2024, MSRV 1.91

### Testing

- **Unit tests**: Vitest with jsdom, setup in `apps/oweb/tests/setup.ts`
- **E2E**: Playwright, config in `apps/oweb/playwright.config.ts`
- **Rust**: `cargo test --workspace -- --test-threads=1`
- Test files live alongside source in `__tests__/` directories or use `.test.ts(x)` suffix
