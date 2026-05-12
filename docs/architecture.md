# 🏗️ CyberGuard — Architecture Overview

## System Architecture

CyberGuard follows a **monolithic Next.js architecture** with clear separation of concerns — a modern full-stack approach ideal for a security operations platform that needs real-time updates, server-side rendering, and a unified deployment target.

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER CLIENT                           │
│   React 19 + Next.js App Router + TailwindCSS + shadcn/ui       │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / WebSocket (Socket.io)
┌────────────────────────▼────────────────────────────────────────┐
│                     NEXT.JS SERVER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  App Router  │  │  API Routes  │  │  Socket.io Server    │  │
│  │  (SSR/SSG)   │  │  /api/**     │  │  Real-time events    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Supabase    │  │  Groq API    │  │  CrewAI Pipeline     │  │
│  │  (Postgres)  │  │  (LLM)       │  │  (AI Agents)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### UI Design System

The platform uses a **unified dark cybersecurity aesthetic** across all pages, established through:

- **Global CSS variables** in `globals.css` — all colors defined as HSL tokens (`--primary`, `--background`, `--card`, etc.)
- **Emerald primary palette** — replaced all legacy blue/cyan colours with a consistent emerald green theme (`#10b981`)
- **`BackgroundEffects` component** — ambient glowing orbs rendered exclusively on the landing page (`src/components/layout/background-effects.tsx`)
- **Glassmorphism** — sidebar and header use `backdrop-blur` where appropriate

### Layout Structure

```
Root Layout (layout.tsx)
└── ThemeProvider + AuthProvider
    ├── Landing Page  →  BackgroundEffects + Navigation + Sections + Footer
    └── Dashboard/Settings/Admin Pages
        └── Full-Width Header (CyberGuard logo + system status + notifications + user menu)
            └── Sidebar (nav links + last update timestamp)
                └── <main> page content
```

> **Key change:** All authenticated pages (Dashboard, Settings, Admin) use a **top-first layout** — the `Header` spans 100% width at the top, with the `Sidebar` sitting below it on the left. This was achieved by restructuring the flex direction in each layout file.

### Page Structure

| Route | Layout File | Description |
|---|---|---|
| `/` | `app/layout.tsx` | Landing page with background effects |
| `/dashboard` | `app/(dashboard)/layout.tsx` | Main ops dashboard |
| `/threats` | `app/(dashboard)/layout.tsx` | Threat intelligence table |
| `/risk-analysis` | `app/(dashboard)/layout.tsx` | Risk prioritization |
| `/incident-response` | `app/(dashboard)/layout.tsx` | Incident management |
| `/playbooks` | `app/(dashboard)/layout.tsx` | Response playbooks |
| `/reports` | `app/(dashboard)/layout.tsx` | Report generation |
| `/settings/**` | `app/settings/layout.tsx` | User settings |
| `/admin` | `app/admin/layout.tsx` | Admin panel |

---

## Backend Architecture

### API Routes (`/src/app/api/`)

All API routes follow a **DB-first with mock fallback** pattern:

```typescript
try {
  const data = await querySupabase(...)
  return NextResponse.json(data)
} catch {
  return NextResponse.json(MOCK_DATA, { headers: { 'X-Data-Source': 'mock' } })
}
```

| Endpoint | Methods | Description |
|---|---|---|
| `/api/dashboard/metrics` | GET | Aggregated security metrics |
| `/api/dashboard/chart-data` | GET | Time-series threat data |
| `/api/threats` | GET, POST | Threat indicators & AI analysis trigger |
| `/api/threats/job` | GET | AI pipeline job polling status |
| `/api/risk-analysis` | GET | Asset risk assessments |
| `/api/incident-response` | GET, POST | Incident CRUD (validated) |
| `/api/playbooks` | GET | Response playbooks with search |
| `/api/reports` | GET, POST | Security report generation |

### Error Handling & Validation
- **Input Validation**: All `POST` endpoints validate required fields and return `400 Bad Request` on failure.
- **Resilience**: Every API call is wrapped in `try/catch`. On database failure, the system falls back to built-in **mock data** and sets the `X-Data-Source: mock` header.
- **SQL Security**: All queries use parameterized statements to prevent SQL injection.


### Real-Time Layer (Socket.io)

Events emitted by the server and consumed by client components:

| Event | Payload | Consumer |
|---|---|---|
| `metrics:update` | `{ updatedAt }` | Sidebar last-update timestamp |
| `chart:update` | — | ThreatChart re-fetch data |
| `threats:new` | `{ indicator_value }` | Header notification bell |
| `incidents:update` | `{ cve_id, id }` | Header notification bell |
| `agent:complete` | `{ job_id }` | Header notifications + RunAnalysisButton |

### Real-Time Workflow
1. **Trigger**: An API request (e.g., `POST /api/incident-response`) modifies the database.
2. **Emit**: The Next.js server emits a Socket.io event to all connected clients.
3. **Listen**: Client-side hooks in `Header` or `Sidebar` receive the event and update the UI state or trigger a data re-fetch.


---

## AI Pipeline

The **Run AI Analysis** button triggers a 5-stage CrewAI pipeline:

1. **Threat Intelligence** — enriches indicators via external feeds
2. **Vulnerability Assessment** — maps CVEs to assets
3. **Risk Scoring** — computes criticality weights
4. **Incident Response** — generates recommended actions
5. **Reporting** — produces an executive summary with posture score

The pipeline is powered by **Groq API** (`llama-3.3-70b-versatile`) for fast LLM inference.

---

## Database Schema (Supabase / Postgres)

```sql
threats          (id, title, severity, status, source, indicator_value, created_at)
risk_analyses    (id, asset, risk_level, vulnerabilities, exposure_time, created_at)
incidents        (id, title, description, severity, status, assignee, created_at)
playbooks        (id, title, category, description, steps jsonb, created_at)
reports          (id, title, type, status, threats_count, resolved_count, created_at)
dashboard_metrics(id, threats_detected, risk_score, incidents_active, systems_monitored)
profiles         (id, full_name, role, avatar_url, created_at)  -- extends auth.users
```

---

## Component Map

```
src/components/
├── layout/
│   ├── header.tsx              Full-width top navbar (logo, status, notifications, user)
│   ├── sidebar.tsx             Left nav (links + last-update footer)
│   └── background-effects.tsx  Landing page ambient glow orbs
├── dashboard/
│   ├── run-analysis-button.tsx AI pipeline trigger + progress panel
│   └── recent-incidents.tsx
├── threats/
│   ├── threat-chart.tsx        Emerald area chart (Recharts)
│   └── threats-table.tsx
├── risk-analysis/
│   └── risk-prioritization.tsx
├── incident-response/
│   └── incidents-list.tsx
├── playbooks/
│   └── playbook-detail-panel.tsx
├── reports/
│   ├── report-card.tsx
│   └── report-detail-panel.tsx
├── landing/
│   ├── navigation.tsx
│   ├── hero-section.tsx
│   ├── features-section.tsx
│   └── footer.tsx
├── auth/
│   └── user-menu.tsx
└── ui/                         shadcn/ui primitives
```
