# 📋 CyberGuard — Changelog

All notable changes to CyberGuard are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [3.5.0] — 2026-07-03 (Current)

### New Feature — Viewer Role (RBAC)
- Added a 4th role, **`viewer`**: can view all dashboards/data and trigger the AI analysis pipeline, but cannot delete data or access user/admin management. Any number of accounts may hold this role — an admin assigns it from the Admin Panel's Users tab like any other role.
- `docs/DATABASE.md`, `docs/SETUP.md`, and `README.md` already documented a `viewer` role from an earlier planning pass, but it was never wired into the actual permission code (`UserRole` only had `admin`/`analyst`/`manager`) — this release closes that gap and corrects the docs, which had described it as pure read-only (it also gets pipeline access).
- Updated `src/lib/auth/types.ts` (`UserRole`, `ROLE_PERMISSIONS.viewer`, `canAccess()`, `getRoleLabel()`, `getRoleBadgeColor()`), `src/lib/auth.ts` (duplicate server-side `UserRole`/`rolePermissions`), `src/lib/supabase/middleware.ts` (`/reports` route now allows `viewer`), and the Admin Panel's Users tab (role dropdown + stat card).
- **Fixed a pre-existing security gap found while implementing this**: the incident/report/playbook `DELETE` API routes had *no server-side role check at all* — only the UI hid the delete button, so any authenticated user could delete via a direct API call regardless of role. Added a shared `requireDeletePermission()` guard (`src/lib/auth/require-delete-permission.ts`) enforcing `canDeleteData` (admin-only) on all three routes. Also added the missing UI gate on the playbook delete button, which previously had none (`incident-details.tsx` and `report-card.tsx` already gated theirs).

### Admin Panel — Fixed Silent Role/Status Update Failures + User Delete
- **Root cause found**: `UsersTab`'s role/active-status dropdown applied its optimistic UI update unconditionally, even when the underlying `PATCH /api/admin/users/[id]` request failed — so a role change could appear to succeed in the UI while the database write was silently rejected. This is why assigning `viewer` briefly appeared to work in the Admin Panel but never landed in Supabase: `profiles.role` is a native Postgres **enum type** (`user_role`), not `text` with a CHECK constraint as the docs assumed, and the enum didn't have `'viewer'` as a valid value yet.
- Fixed `updateUser()` (`src/app/admin/_tabs/users-tab.tsx`) to check the response before applying the optimistic update, and surface a visible error banner on failure instead of failing silently.
- **Migration required**: run `alter type user_role add value if not exists 'viewer';` in the Supabase SQL editor once — see docs/SETUP.md.
- **New**: admins can now permanently delete a user (e.g. someone who's left the company) via a delete icon next to Deactivate in the Users tab, with a confirmation prompt. Added `DELETE /api/admin/users/[id]` (`src/app/api/admin/users/[id]/route.ts`) — admin-only, blocks self-deletion, deletes the Supabase Auth user (cascades to the `profiles` row), and writes a `USER_DELETED` audit log entry.

## [3.4.0] — 2026-07-03

### New Feature — Notification Bell
- **`NotificationBell` component** (`src/components/layout/notification-bell.tsx`) restored in the Header next to the system-status indicator — previously removed from the codebase despite being referenced in the docs, and before that, only ever showed a single static "Welcome to CyberGuard" placeholder.
- Subscribes to the real `alert:new` Socket.io event (in-memory only, resets on refresh — no history is fetched or persisted server-side).
- **New alert triggers** — previously only "AI analysis complete" fired an alert:
  - Per-item **critical threat detected** and **critical incident opened** alerts, emitted from `src/app/api/threats/job/route.ts` as the AI pipeline saves results.
  - **Critical incident opened**, emitted from `src/app/api/incident-response/route.ts` when an analyst manually creates a critical-severity incident.
- Extracted the repeated "POST to the internal Socket.io webhook" logic into a shared `emitSocketEvent` / `emitAlert` helper (`src/lib/socket/emit-socket-event.ts`), replacing three duplicated inline implementations.
- **Per-notification read/unread state** — each item tracks its own read state (unread = bold + highlighted row + filled dot); click the dot to toggle a notification back to unread. "Mark all read" and "Clear all" act on the whole list. Previously the entire unread badge cleared the instant the panel opened, with no way to tell what was new.
- Fixed two rendering bugs found while building this: (1) the popover's `ScrollArea` nested inside an animated Popover was letting page content bleed through in Chromium — fixed with explicit solid backgrounds at every nested layer; (2) the list used `max-h-80` instead of a fixed `h-80`, which doesn't reliably constrain a Radix `ScrollArea` Viewport's percentage height, so the panel grew off-screen instead of scrolling.

### Real-Time Monitoring Toggle — Persistence Fix
- Fixed: the toggle reset to LIVE on every page refresh regardless of what the user had set, because its state was plain in-memory React state with no persistence.
- New shared module `src/lib/realtime-toggle-events.ts` persists the toggle to `localStorage` (`cyberguard:realtime-enabled`) and broadcasts a custom event so other mounted components react immediately when it changes.
- The Sidebar's "Last Update" timestamp now respects the same paused state (previously it kept ticking from live socket updates even while the dashboard was frozen) — `ai-analysis:completed` still always updates it, since that's an explicit action result rather than a live tick.

### AI Pipeline — Rate-Limit Retry Fix & Token Visibility
- **Root cause found**: a Groq rate-limit hit partway through the 5-agent pipeline caused the retry to call `kickoff()` again, restarting **all 5 tasks from scratch** — since task 5 (reporting) carries the most context and is the likeliest place to hit a TPM cap, one unlucky run could multiply total token consumption up to 4x.
- **Fixed** (`.agents/crew.py`): retries now resume from the last successfully completed task via CrewAI's built-in `Crew.replay()`, which reuses each task's already-persisted output instead of re-running it.
- Fixed a related dead-code bug the new tests caught: when retries were fully exhausted, the code always re-raised an exception instead of returning the graceful `{"error": ...}` dict it was clearly written to return — meaning the token-usage diagnostic was never visible on the run that needed it most.
- **Added token usage logging** — every task logs its own token cost; every run logs and returns a `token_usage` summary (`total_tokens`, `prompt_tokens`, `completion_tokens`, `successful_requests`) in the pipeline metadata.
- Added `.agents/tests/test_crew_retry.py` (5 tests, mocked — a real test would cost real Groq tokens) covering the retry/resume control flow.

### Cleanup
- Removed `update_risk_colors.js` — a one-off Node script from the 1.3.0 color-system migration; it already did its job (no target file still contains the colors it replaces) and nothing referenced it.
- Removed `scratch/` (untracked, ad-hoc debug scripts, no references anywhere) and added it to `.gitignore`.

### Docs — Fixed a Stale Database Schema
- `docs/SETUP.md`'s "Create Tables in Supabase" SQL used lowercase `snake_case` table/column names (`threats`, `risk_analyses`, `risk_level`, ...) left over from the original 1.0.0 schema — the app was later migrated to a Prisma-modeled schema (`prisma/schema.prisma`) with PascalCase tables and camelCase columns (`"Threat"`, `"RiskAnalysis"`, `"riskLevel"`, ...), but the setup doc was never updated. Anyone following it verbatim would have created tables the live app doesn't query at all.
- Rewrote the schema to match what the app actually queries (verified against every `.from(...)` call in `src/`), and added the tables that were missing entirely: `assets`, `audit_logs`, `data_source_configs`, `agent_jobs`, `"DashboardMetric"`.
- Added `pnpm run db:init` / `db:seed` / `db:setup` / `db:test` to the documented npm scripts table — these existed in `package.json` but were never listed.

## [3.3.0] — 2026-07-03

### Testing
- **Automated test suites added** — previously zero automated tests existed; the platform relied entirely on manual `scripts/inspect-*.ts` checks.
- **Python** (`.agents/tests/`, pytest) — 63 tests covering `risk_engine_py.py` (weighting, clamping, severity thresholds, exposure multiplier), `crew.py`'s `_extract_json` LLM-output parser, `tools.py`'s NVD/OTX/MITRE/asset-lookup tools (external calls mocked with `respx`), and the new Redis job store. Runs fully offline.
- **TypeScript** (`src/lib/*.test.ts`, Vitest) — 65 tests covering `validation.ts` Zod schemas (XSS sanitization, strict-mode rejection, enum/range validation) and `risk_engine.ts` (scoring, batching, posture summary, explainability).
- Run via `pnpm test` (Node) and `pytest` from `.agents/` (Python).

### Evaluation
- **`docs/EVALUATION.md`** + `.agents/evaluate.py` — the risk-scoring engine is benchmarked against 8 labeled cases (4 real CVEs: Log4Shell, EternalBlue/WannaCry, Heartbleed, the Apache Struts CVE behind the 2017 Equifax breach, plus PrintNightmare, and 3 synthetic boundary cases) with 100% agreement against real-world/industry-consensus severity.
- The same benchmark file (`.agents/data/risk_scoring_benchmark.json`) is evaluated by both the Python and TypeScript engines, cross-checking that the two implementations agree with each other as well as with ground truth.
- Added parametrized monotonicity checks (increasing any risk factor must never decrease the score) on both sides.

### AI Pipeline Job Store Persistence
- Replaced the in-memory `jobs: dict` in `main.py` (lost on every restart/redeploy) with `.agents/job_store.py`, a Redis-backed store using the same Upstash instance the Node app already uses. Falls back to in-memory automatically if Redis credentials are absent.
- `Dockerfile` updated to copy `job_store.py` and the new `data/` directory into the image (previously missing — would have crashed on deploy).

### MITRE ATT&CK Coverage
- Replaced the ~15-technique hardcoded dictionary in `tools.py` with the full official ATT&CK Enterprise matrix (697 techniques), trimmed from MITRE's public STIX bundle (`github.com/mitre/cti`) into `.agents/data/mitre_attack_enterprise.json` (~890 KB) — detection and mitigation guidance reconstructed from MITRE's newer `x-mitre-detection-strategy`/`x-mitre-analytic` and `course-of-action` relationship objects.
- `mitre_lookup_tool`'s output now includes description, detection, and mitigation text (previously the hardcoded version had these fields but never actually returned them).

### Bug Fixes
- Fixed `_extract_json` in `crew.py`: when LLM output had prose before a JSON array (e.g. `"Playbooks: [{...}, {...}]"`), the function greedily matched the first `{...}` object inside the array instead of the full array, silently dropping all but the first element. Found via the new test suite.

## [3.2.0] — 2026-06-21

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
