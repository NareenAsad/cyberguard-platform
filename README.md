# CyberGuard — AI-Driven Threat Intelligence & Incident Response

An enterprise-grade, AI-powered cybersecurity platform built as a Final Year Project. CyberGuard unifies real-time threat monitoring, AI-assisted analysis, and automated incident response into a single, professional security operations interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D)](https://upstash.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-10b981)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Platform Status

| Area | Status | Details |
|---|---|---|
| **UI / Design System** | Complete | Unified electric cyan and neon green cyber theme across all pages |
| **Layout Architecture** | Complete | Full-width navbar + sidebar on all authenticated pages |
| **Landing Page** | Complete | Animated background effects, hero, features, footer |
| **Dashboard** | Complete | Real-time metrics, threat chart, incidents, AI analysis |
| **Authentication** | Complete | Supabase Auth — login, register, session, role-based access |
| **Admin Panel** | Complete | User management, system health, data sources, assets |
| **Settings / Profile** | Complete | Profile editing, role display, account details |
| **Database Integration** | Complete | Supabase Postgres — 7 tables, DB-first + mock fallback |
| **API Layer** | Complete | 8 endpoints with strict Zod validation, input sanitization, and sliding-window rate limiting |
| **Redis Integration** | Complete | Upstash Redis 7.2 — rate limiting, API caching, real-time metrics persistence |
| **Real-Time / Socket.io** | Complete | Socket.io 4.8 — live metrics every 30 s, chart data every 10 s, instant AI pipeline completion events |
| **Real-Time Toggle** | Complete | Per-user on/off switch, persisted across refreshes — pause live updates to focus on static snapshot during analysis |
| **Notifications** | Complete | Header bell with per-item read/unread state — live alerts on AI analysis completion and critical threats/incidents |
| **AI Pipeline** | Complete | 5-stage CrewAI pipeline via Groq LLM, Redis-persisted job state, rate-limit-aware retry that resumes instead of restarting |
| **MITRE ATT&CK Coverage** | Complete | Full official Enterprise matrix (697 techniques) loaded from `.agents/data/mitre_attack_enterprise.json` |
| **Automated Testing** | Complete | 68 pytest tests (Python AI service) + 65 Vitest tests (Node/TS) — see [Testing](#testing) |
| **Evaluation** | Complete | Risk-scoring engine benchmarked against 8 known incidents (100% accuracy) + monotonicity checks — see [docs/EVALUATION.md](./docs/EVALUATION.md) |

---

## Design System

CyberGuard uses a **unified dark cybersecurity aesthetic** established in `src/app/globals.css`:

- **Primary colour** — Electric Cyan (`#00e5ff`) used for all interactive elements, buttons, chart lines, and glowing accents
- **Accent colour** — Neon Green (`#00e676`) used for online indicators, healthy states, and active highlights
- **Background** — Deep navy-black (`hsl(224 71% 4%)`) for a clean ops feel
- **Typography** — Inter (Google Fonts)
- **Glassmorphism** — Sidebar and header use `backdrop-blur` where appropriate
- **Ambient effects** — Glowing cyan/neon green orb background rendered on the landing page only (`BackgroundEffects` component)

### Layout Structure (all authenticated pages)

```
┌──────────────────── Full-Width Header ────────────────────────┐
│   CyberGuard     [System Status]                       [User] │
├──────────┬────────────────────────────────────────────────────┤
│          │                                                     │
│ Sidebar  │              Page Content                          │
│  (nav)   │                                                     │
│          │                                                     │
└──────────┴────────────────────────────────────────────────────┘
```

---

## Features

### Landing Page
- **Premium Cybersecurity Aesthetic** — Structural blueprint grid-line overlays (`BackgroundEffects` component) with subtle cyan and green radial glow gradients.
- **Custom Mouse Cursor** — Lag-interpolated Cyan dot-and-ring follower cursor (`CustomCursor` component) with active resizing micro-animations on interactive hovers.
- **Hero & Live Threat Monitor** — Two-column split layout displaying professional bold headlines, interactive agent badges, CTA controls, and a live-scrolling animated threat monitor console backed by key SOC statistics.
- **Seamless Integrations Marquee** — Looping horizontal scroller track (`Marquee` component) highlighting continuous integrations (NVD, OTX, ThreatFox, MITRE ATT&CK...).
- **Before/After Incident Slider** — Interactive drag-slider (`TransformationSlider` component) showing the visual transformation between chaotic unmapped manual logs (200+ days breach gap) and automated multi-agent response (mitigated in 3s).
- **Workflow Pipeline & Specialists Grid** — Step-by-step security pipeline with large index row cards, and a designated team grid profile section showcasing the 5 specialized AI agents with online status tracking.

### Dashboard
- Real-time metrics (threats detected, risk score, active incidents, systems monitored) — pushed by Socket.io every 30 seconds
- Cyber cyan area chart for threat activity with live data points pushed every 10 seconds via Socket.io; 24h / 7d / 30d time range picker
- **Real-Time Monitoring Toggle** — on/off switch that pauses Socket.io updates and freezes the dashboard to a static snapshot; analysts can review pipeline results without numbers changing underneath them
- Recent incidents list with severity badges
- **Run AI Analysis** — triggers 5-stage CrewAI pipeline with live progress panel; dispatches `ai-analysis:completed` browser event on completion to refresh all pages

### Threats
- Full threat indicator table with severity filtering
- Source, confidence, and status tracking

### Risk Analysis
- Asset risk prioritization ranked by severity
- Vulnerability count and exposure time tracking
- Risk score breakdown with recommendations

### Incident Response
- Active incident list with detail panel
- Timeline view, assignee, status management
- Playbook integration

### Playbooks
- Pre-built response procedures by category (Malware, Ransomware, Phishing…)
- Full-text search
- Step-by-step execution guidance

### Reports
- Security, compliance, and threat report tracking
- Status tracking (Completed / In Progress)
- Statistics summary per report

### Admin Panel & RBAC
- User management (roles: admin, manager, analyst, viewer)
- Granular Role-Based Access Control (RBAC) restricting exports, deletions, and system configuration by role
- System health monitoring and audit logging
- Data source configuration with toggles
- Asset inventory

---

## Security Hardening

To align with OWASP best practices, CyberGuard implements robust API defense and verification mechanisms:

- **Redis-Backed Sliding-Window Rate Limiting** (`src/lib/rate-limit.ts`) — Distributed rate limiter using **Upstash Redis sorted sets** (`ZADD` / `ZREMRANGEBYSCORE` / `ZCARD` pipeline). Tracks clients by authenticated User ID (preferred) or Client IP. Returns RFC-compliant headers (`Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`). Persists across server restarts and works correctly across multiple instances. Gracefully falls back to an in-memory store if Redis is unavailable.
- **Redis API Response Caching** (`src/lib/cache.ts`) — Generic cache layer wrapping dashboard API routes. Dashboard metrics are cached for **30 seconds** and chart data for **60 seconds** (keyed per `timeRange`). Cache entries are namespaced under `cg:cache:*` and auto-expire via Redis TTL. Returns `X-Cache: HIT / MISS` headers for transparent debugging.
- **Real-Time Metrics Persistence** (`server.js`) — Live dashboard metrics (threat count, risk score, active incidents) are stored in Redis under `realtime:metrics` with a 24-hour TTL, so simulated values survive server restarts.
- **Strict Schema Validation** (`src/lib/validation.ts`) — Centralized Zod validation layer covering all public and administrative route payloads. Enforces types, strict structures, limits, and rejects unknown fields via `.strict()`.
- **XSS Mitigation & Input Sanitization** — Automatically sanitizes and escapes HTML entities from incoming string variables before processing or storing them in Supabase.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4.x + shadcn/ui |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Cache / Rate Limiting | Upstash Redis 7.2 (REST API) |
| Real-time | Socket.io 4.8 (WebSocket) + Custom Browser Events (`ai-analysis:completed`) |
| AI / LLM | CrewAI + Groq (`llama-3.3-70b-versatile`) |
| Deployment | Vercel |

---

## Backend

CyberGuard's backend runs entirely within **Next.js API Routes**. It follows a **DB-first with mock fallback** pattern to ensure high availability and resilience.

> For implementation details, AI pipeline breakdown, and validation rules, see the [Backend Documentation](./docs/BACKEND.md).

---

## Database

The platform uses **Supabase** (managed PostgreSQL) with Row Level Security (RLS) to manage security-critical data.

> Detailed table schemas, user roles, and access control policies are documented in the [Database Documentation](./docs/DATABASE.md).

---

## Real-Time (Socket.io + Browser Events)

Live dashboard updates are powered by a **dual real-time system**:

1. **Socket.io** (`server.js` + `src/lib/socket/`) — persistent WebSocket connection on `/api/socket`. Server broadcasts `metrics:update` every 30 s and `chart:update` every 10 s to all connected clients. The `RunAnalysisButton` also triggers socket events via an internal webhook (`POST /api/internal/socket-emit`) when the AI pipeline completes.

2. **Custom Browser Events** (`ai-analysis:completed`) — dispatched by `RunAnalysisButton` on pipeline completion. Hooks (`usePageRefresh`) respond by calling `router.refresh()` to re-run Server Components and pull fresh data from Supabase across all dashboard pages.

3. **Real-Time Monitoring Toggle** (`RealtimeToggle` component) — lets any authenticated user (admin, manager, analyst) pause Socket.io-driven updates. When **paused**, the dashboard freezes at the last snapshot so users can analyse the AI pipeline output without live numbers changing.

> Event architecture, data refresh hooks, and usage examples are described in the [Client Events Documentation](./docs/WEBSOCKET.md).

---

## Project Structure

```
cyberguard-platform/
├── docs/
│   ├── ARCHITECTURE.md       System & component architecture
│   ├── SETUP.md              Installation & database setup
│   ├── API.md                Full API & WebSocket reference
│   └── CHANGELOG.md          Version history & change log
├── public/                   Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx        Root layout (ThemeProvider, AuthProvider)
│   │   ├── page.tsx          Landing page
│   │   ├── globals.css       Design system tokens (CSS variables)
│   │   ├── (dashboard)/      Dashboard route group
│   │   │   ├── layout.tsx    Full-width header + sidebar layout
│   │   │   ├── dashboard/
│   │   │   ├── threats/
│   │   │   ├── risk-analysis/
│   │   │   ├── incident-response/
│   │   │   ├── playbooks/
│   │   │   └── reports/
│   │   ├── settings/
│   │   │   ├── layout.tsx    Settings layout (same structure)
│   │   │   ├── page.tsx      Settings main page
│   │   │   └── profile/      Profile settings
│   │   ├── admin/
│   │   │   ├── layout.tsx    Admin layout (same structure)
│   │   │   ├── page.tsx      Admin panel
│   │   │   └── _tabs/        User, System, DataSources, Assets tabs
│   │   └── api/              Next.js API routes
│   │       ├── dashboard/
│   │       ├── threats/
│   │       ├── risk-analysis/
│   │       ├── incident-response/
│   │       ├── playbooks/
│   │       └── reports/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx              Full-width top navbar
│   │   │   ├── sidebar.tsx             Left navigation (socket-aware last-update)
│   │   │   ├── background-effects.tsx  Landing page grid blueprint overlay
│   │   │   └── custom-cursor.tsx       Mouse follow dot-and-ring follower
│   │   ├── dashboard/
│   │   │   ├── run-analysis-button.tsx AI pipeline trigger + progress panel
│   │   │   ├── realtime-toggle.tsx     Live / Paused Socket.io toggle
│   │   │   ├── metrics-grid.tsx        4 live metric cards
│   │   │   ├── quick-stats.tsx         Summary stats panel
│   │   │   └── recent-incidents.tsx    Latest incidents list
│   │   ├── threats/
│   │   ├── risk-analysis/
│   │   ├── incident-response/
│   │   ├── playbooks/
│   │   ├── reports/
│   │   ├── landing/
│   │   │   ├── marquee.tsx             Looping integrations marquee
│   │   │   └── transformation-slider.tsx Draggable before/after comparison slider
│   │   ├── auth/
│   │   └── ui/                         shadcn/ui primitives
│   ├── hooks/
│   │   ├── use-socket-events.ts        useSocketMetrics, useSocketChartData, useSocketIncidents
│   │   ├── use-page-refresh.ts         ai-analysis:completed browser event listener
│   │   └── use-fetch-data.ts           Generic API fetch hook
│   ├── lib/
│   │   ├── auth/             Auth context, types, helpers
│   │   ├── socket/
│   │   │   ├── socket.ts              Socket.io client singleton (initSocket, event helpers)
│   │   │   ├── socket-server.ts       Socket.io server initializer
│   │   │   └── mock-data-generator.ts Data generators for simulated broadcasts
│   │   ├── supabase/         Client & server Supabase instances
│   │   ├── redis.ts          Upstash Redis singleton client
│   │   ├── cache.ts          Generic Redis cache helpers (get/set/del/invalidate)
│   │   ├── rate-limit.ts     Redis sliding-window rate limiter
│   │   └── agent-client.ts   AI pipeline health check
│   └── proxy.ts              Next.js route matcher (public routes)
├── server.js                 Custom Node.js server (Socket.io + Redis metrics)
└── README.md
```

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/NareenAsad/cyberguard-platform.git
cd cyberguard-platform
pnpm install

# 2. Set up environment variables
# Create .env.local and add the following:
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI
GROQ_API_KEY=your_groq_api_key

# Upstash Redis (Redis 7.2) — get from https://console.upstash.com
# Required for rate limiting, API caching, and metrics persistence
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

```bash
# 3. Run database migrations (SQL in docs/SETUP.md)

# 4. Start dev server (runs custom Node.js server with Socket.io)
pnpm run dev
# → http://localhost:3000
# → Socket.io ready on ws://localhost:3000/api/socket
```

> **Redis setup:** Create a free database at [console.upstash.com](https://console.upstash.com) → copy the REST URL and token. Without Redis credentials the app runs normally using in-memory fallbacks.

> Full setup instructions: [docs/SETUP.md](./docs/SETUP.md)

---

## Documentation

| File | Contents |
|---|---|
| [docs/ARCHITECTURE.md](./docs/architecture.md) | System design, layout structure, component map |
| [docs/SETUP.md](./docs/SETUP.md) | Installation, env vars, DB setup, deployment |
| [docs/API.md](./docs/API.md) | REST endpoints + WebSocket events reference |
| [docs/WEBSOCKET.md](./docs/WEBSOCKET.md) | Real-time architecture — Socket.io + browser events |
| [docs/BACKEND.md](./docs/BACKEND.md) | Backend patterns, rate limiting, Redis, AI pipeline |
| [docs/EVALUATION.md](./docs/EVALUATION.md) | Risk-scoring engine benchmark & monotonicity results |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Full version history and change log |

---

## Testing

**Node / TypeScript** (Vitest — validation schemas, risk-scoring engine, known-incident benchmark):

```bash
pnpm test          # run once
pnpm test:watch    # watch mode
```

**Python AI service** (pytest — risk engine, LLM JSON-extraction robustness,
CrewAI tools with mocked external APIs, Redis job store, evaluation benchmark):

```bash
cd .agents
venv\Scripts\python.exe -m pytest      # Windows
# or: source venv/bin/activate && pytest
```

Both suites run fully offline — external HTTP calls (NVD, OTX, Redis) are
mocked, so no API keys are required to run them.

---

## Important Notes

- **Educational purpose** — Built as a Final Year Project. Validate with security professionals before any production use.
- **Data privacy** — Uses Supabase Row Level Security (RLS). Keep your `SUPABASE_SERVICE_ROLE_KEY` secret.
- **AI pipeline** — Requires Groq API key. Without it, the Run AI Analysis button will return an error.
- **Real-time** — Socket.io runs via a custom Node.js server (`server.js`). Standard `next start` does not include Socket.io; always start with `pnpm run dev` or `node server.js`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

<div align="center">

**Built with pride by the CyberGuard Team — Lahore University for Women University**

**Version:** 3.4.0 &nbsp;|&nbsp; **Status:** Active Development &nbsp;|&nbsp; **Last Updated:** July 2026

</div>
