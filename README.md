# 🛡️ CyberGuard — AI-Driven Threat Intelligence & Incident Response

An enterprise-grade, AI-powered cybersecurity platform built as a Final Year Project. CyberGuard unifies real-time threat monitoring, AI-assisted analysis, and automated incident response into a single, professional security operations interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-10b981)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ Platform Status

| Area | Status | Details |
|---|---|---|
| **UI / Design System** | ✅ Complete | Unified electric cyan and neon green cyber theme across all pages |
| **Layout Architecture** | ✅ Complete | Full-width navbar + sidebar on all authenticated pages |
| **Landing Page** | ✅ Complete | Animated background effects, hero, features, footer |
| **Dashboard** | ✅ Complete | Real-time metrics, threat chart, incidents, AI analysis |
| **Authentication** | ✅ Complete | Supabase Auth — login, register, session, role-based access |
| **Admin Panel** | ✅ Complete | User management, system health, data sources, assets |
| **Settings / Profile** | ✅ Complete | Profile editing, role display, account details |
| **Database Integration** | ✅ Complete | Supabase Postgres — 7 tables, DB-first + mock fallback |
| **API Layer** | ✅ Complete | 8 endpoints with validation and graceful degradation |
| **Real-time (WebSocket)** | ✅ Complete | Socket.io — live metrics, notifications, agent events |
| **AI Pipeline** | ✅ Complete | 5-stage CrewAI pipeline via Groq LLM |
| **Documentation** | ✅ Complete | 5 clean docs (README, Architecture, Setup, API, Changelog) |

---

## 🎨 Design System

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
│  🛡 CyberGuard    [System Status]  [🔔 Notifications]  [User] │
├──────────┬────────────────────────────────────────────────────┤
│          │                                                     │
│ Sidebar  │              Page Content                          │
│  (nav)   │                                                     │
│          │                                                     │
└──────────┴────────────────────────────────────────────────────┘
```

---

## 🎯 Features

### 🏠 Landing Page
- Animated glowing ambient background (fixed cyan/neon green orbs)
- Hero section with live security stats
- Features grid showcasing platform capabilities
- Full footer with navigation and social links

### 📊 Dashboard
- Real-time metrics (threats detected, risk score, active incidents, systems monitored)
- Cyber cyan area chart for threat activity with 24h / 7d / 30d time range picker
- Recent incidents list with severity badges
- **Run AI Analysis** — triggers 5-stage CrewAI pipeline with live progress panel

### 🔍 Threats
- Full threat indicator table with severity filtering
- Source, confidence, and status tracking

### 📈 Risk Analysis
- Asset risk prioritization ranked by severity
- Vulnerability count and exposure time tracking
- Risk score breakdown with recommendations

### 🚨 Incident Response
- Active incident list with detail panel
- Timeline view, assignee, status management
- Playbook integration

### 📖 Playbooks
- Pre-built response procedures by category (Malware, Ransomware, Phishing…)
- Full-text search
- Step-by-step execution guidance

### 📄 Reports
- Security, compliance, and threat report tracking
- Status tracking (Completed / In Progress)
- Statistics summary per report

### ⚙️ Admin Panel & RBAC
- User management (roles: admin, manager, analyst, viewer)
- Granular Role-Based Access Control (RBAC) restricting exports, deletions, and system configuration by role
- System health monitoring and audit logging
- Data source configuration with toggles
- Asset inventory

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4.x + shadcn/ui |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Real-time | Socket.io |
| AI / LLM | CrewAI + Groq (`llama-3.3-70b-versatile`) |
| Deployment | Vercel |

---

## 🖥️ Backend

CyberGuard's backend runs entirely within **Next.js API Routes**. It follows a **DB-first with mock fallback** pattern to ensure high availability and resilience.

> For implementation details, AI pipeline breakdown, and validation rules, see the [Backend Documentation](./docs/BACKEND.md).

---

## 🗄️ Database

The platform uses **Supabase** (managed PostgreSQL) with Row Level Security (RLS) to manage security-critical data.

> Detailed table schemas, user roles, and access control policies are documented in the [Database Documentation](./docs/DATABASE.md).

---

## 🔌 WebSocket (Real-Time)

Real-time updates are powered by **Socket.io**, providing instant visibility into threats and system events across the dashboard.

> Real-time architecture, event mapping, and client-side usage examples are described in the [WebSocket Documentation](./docs/WEBSOCKET.md).

---

## 📂 Project Structure

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
│   │   │   ├── sidebar.tsx             Left navigation
│   │   │   └── background-effects.tsx  Landing page ambient glow
│   │   ├── dashboard/
│   │   ├── threats/
│   │   ├── risk-analysis/
│   │   ├── incident-response/
│   │   ├── playbooks/
│   │   ├── reports/
│   │   ├── landing/
│   │   ├── auth/
│   │   └── ui/                         shadcn/ui primitives
│   ├── lib/
│   │   ├── auth/             Auth context, types, helpers
│   │   ├── socket/           Socket.io client initializer
│   │   ├── supabase/         Client & server Supabase instances
│   │   └── agent-client.ts   AI pipeline health check
│   └── proxy.ts              Next.js route matcher (public routes)
└── README.md
```

---

## ⚡ Quick Start

```bash
# 1. Clone & install
git clone https://github.com/YOUR_USERNAME/cyberguard-platform.git
cd cyberguard-platform
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY

# 3. Run database migrations (SQL in docs/SETUP.md)

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

> 📖 Full setup instructions: [docs/SETUP.md](./docs/SETUP.md)

---

## 📚 Documentation

| File | Contents |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, layout structure, component map |
| [docs/SETUP.md](./docs/SETUP.md) | Installation, env vars, DB setup, deployment |
| [docs/API.md](./docs/API.md) | REST endpoints + WebSocket events reference |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Full version history and change log |

---

## ⚠️ Important Notes

- **Educational purpose** — Built as a Final Year Project. Validate with security professionals before any production use.
- **Data privacy** — Uses Supabase Row Level Security (RLS). Keep your `SUPABASE_SERVICE_ROLE_KEY` secret.
- **AI pipeline** — Requires Groq API key. Without it, the Run AI Analysis button will return an error.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

<div align="center">

**Built with ❤️ by the CyberGuard Team — Lahore University for Women University**

**Version:** 1.3.0 &nbsp;|&nbsp; **Status:** Active Development &nbsp;|&nbsp; **Last Updated:** May 2026

</div>
