# 📋 CyberGuard — Changelog

All notable changes to CyberGuard are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [3.2.0] — 2026-06-21 (Current)

### Real-Time System Restored & Enhanced
- **Socket.io re-enabled** — `src/lib/socket/socket.ts` and `src/lib/socket/socket-server.ts` replaced their no-op mock stubs with real `socket.io-client` / `socket.io` implementations
- **`server.js` restored** — mock `io` object replaced with `new Server(httpServer, { path: '/api/socket' })`
- **Live broadcasts** — server now emits `metrics:update` every 30 s and `chart:update` every 10 s to all connected clients
- **On-connect snapshot** — each new socket client immediately receives the current metrics state

### New Feature — Real-Time Monitoring Toggle
- **`RealtimeToggle` component** (`src/components/dashboard/realtime-toggle.tsx`) — pulsing LIVE badge (electric cyan) / PAUSED badge (grey) with an accessible toggle switch
- Placed on the Dashboard directly beneath the **Run AI Analysis** button
- When **LIVE**: Socket.io events drive metric cards, chart, and incidents list in real time
- When **Paused**: data freezes at last API snapshot so analysts can review pipeline results without numbers changing
- Socket connection stays alive in both states — only UI state updates are gated

### Docs
- `README.md` bumped to v3.2.0; tech stack row updated to `Socket.io 4.8 + Custom Browser Events`
- `docs/WEBSOCKET.md` rewritten — documents both Socket.io and browser event systems, toggle behaviour, Redis metrics persistence
- `docs/BACKEND.md` updated — Socket.io broadcast table, toggle section, internal socket-emit webhook description

---

## [3.1.0] — 2026-06-20

### Redis Integration
- **Upstash Redis 7.2** added for rate limiting, API response caching, and real-time metrics persistence
- `src/lib/redis.ts` — singleton Upstash client with in-memory fallback
- `src/lib/cache.ts` — generic `cacheGet` / `cacheSet` / `cacheDel` / `cacheInvalidatePrefix` helpers; keys namespaced under `cg:cache:*`
- `src/lib/rate-limit.ts` — sliding-window rate limiter using Redis sorted sets; falls back to in-memory Map
- `server.js` — metrics persisted under `realtime:metrics` key (24h TTL); loaded on startup
- **Real-time / Custom Browser Events** — `ai-analysis:completed` custom event dispatched by `RunAnalysisButton`; `usePageRefresh` hook and `Sidebar` listen and refresh

### Docs
- `README.md` updated to v3.1.0; platform status table, security hardening section, and tech stack updated
- `docs/WEBSOCKET.md` and `docs/BACKEND.md` reconciled with actual implementation

---

## [1.3.0] — 2026-05-12

### UI / Design Overhaul
- **Unified color palette** — replaced legacy colors with a consistent electric cyan (`#00e5ff`) primary theme across all 21+ components
- **Full-width navbar** — restructured `Dashboard`, `Settings`, and `Admin` layouts so `Header` spans 100% of viewport width, with `Sidebar` sitting beneath it
- **CyberGuard logo moved to Header** — shield icon + gradient wordmark now lives in the top-left of the full-width navbar instead of the sidebar top
- **Sidebar cleanup** — removed the logo section from the sidebar; navigation links now start at the top
- **Last Update text fix** — sidebar footer timestamp changed from invisible `text-sidebar-accent` (near-black) to visible `text-emerald-400`
- **Run AI Analysis button** — updated to use `bg-primary` (emerald) instead of hardcoded `bg-blue-600`
- **Threat Activity chart** — all chart colors (line, gradient fill, tooltip, active dot, time-range pills) changed from `cyan` to `emerald`
- **Profile page** — avatar glow ring, icon backgrounds, and Save Changes button updated from blue to emerald
- **Admin page** — layout fixed to full-width header; toggle switches, buttons, and status badges updated to emerald
- **Settings page** — color inputs, buttons, and accent indicators updated to emerald

### Layout Changes
- `app/(dashboard)/layout.tsx` — changed from `flex-row (sidebar | content)` to `flex-col (header / flex-row(sidebar | main))`
- `app/settings/layout.tsx` — same restructure as dashboard layout
- `app/admin/layout.tsx` — same restructure as dashboard layout
- `components/layout/sidebar.tsx` — changed `h-screen` to `h-full` to correctly fill remaining height under full-width header
- `components/layout/header.tsx` — changed `justify-end` to `justify-between` to accommodate left-aligned logo

### Background Effects
- `BackgroundEffects` component scoped back to **landing page only** (removed from root `layout.tsx`)
- Dashboard pages use solid `bg-background` — no ambient glow distractions in the ops view

### Docs
- Deleted 17 redundant/duplicate documentation files
- Consolidated into 5 clean docs: `README.md`, `ARCHITECTURE.md`, `SETUP.md`, `API.md`, `CHANGELOG.md`

---

## [1.2.0] — 2026-05-12

### Added
- **Landing page modularized** — extracted `Navigation`, `HeroSection`, `FeaturesSection`, `Footer` into separate components under `src/components/landing/`
- **`BackgroundEffects` component** — reusable ambient glow component created at `src/components/layout/background-effects.tsx`
- **Footer component** — full footer with nav links, social icons, and copyright
- **Proxy migration** — renamed `middleware.ts` → `proxy.ts` to comply with Next.js 16 routing conventions

### Changed
- `globals.css` — overhauled CSS variable tokens for dark cybersecurity theme
- `threat-chart.tsx` — inline styles converted to Tailwind classes

### Fixed
- Public routes (landing page) no longer redirect to `/login`

---

## [1.1.0] — 2026-04-15

### Added
- **Real-time WebSocket layer** — Socket.io server integrated; events for threats, incidents, metrics, and agent completion
- **`SocketInitializer`** component — establishes socket connection on dashboard mount
- **Run AI Analysis button** — full 5-stage pipeline (Threat Intel → Vuln Assessment → Risk Scoring → IR → Reporting) with job polling
- **Header notifications** — real-time bell icon popover populated from socket events
- **Sidebar last-update** — live timestamp pulled from API metadata and updated via socket

### Changed
- Dashboard layout refactored — sidebar + header extracted to `components/layout/`
- API routes updated to use Supabase DB-first approach with mock fallback

---

## [1.0.0] — 2026-04-01

### Initial Release
- Next.js 16 + React 19 project setup
- Supabase integration (auth + Postgres)
- 6 database tables: `threats`, `risk_analyses`, `incidents`, `playbooks`, `reports`, `dashboard_metrics`
- 7 API routes with input validation and graceful degradation
- Core dashboard pages: Dashboard, Threats, Risk Analysis, Incident Response, Playbooks, Reports
- Authentication flow (login, register, session management)
- Admin panel (user management, system health, data sources, assets)
- Settings pages (profile, preferences)
- Recharts data visualizations
- shadcn/ui component library integration
- Dark theme with TailwindCSS 4.x
