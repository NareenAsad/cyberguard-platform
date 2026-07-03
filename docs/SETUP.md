# ⚡ CyberGuard — Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x+ | Runtime |
| pnpm | Latest | Package manager (`npm install -g pnpm`) |
| Git | Any | Version control |
| Supabase account | — | Database + Auth (free tier works) |
| Groq API key | — | LLM inference for AI pipeline |
| Upstash account | — | Redis 7.2 — rate limiting, caching, metrics (free tier works) |

---

## 1. Clone & Install

```bash
git clone https://github.com/NareenAsad/cyberguard-platform.git
cd cyberguard-platform
pnpm install
```

---

## 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Groq (AI pipeline)
GROQ_API_KEY=<your-groq-api-key>

# Upstash Redis 7.2 (rate limiting, caching, metrics persistence)
UPSTASH_REDIS_REST_URL=https://<your-db-name>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Supabase Credentials
1. Sign up at [supabase.com](https://supabase.com) (free tier)
2. Create a new project
3. Go to **Project Settings → API**
4. Copy **Project URL**, **anon public key**, and **service_role key**

### Getting Groq API Key
1. Sign up at [console.groq.com](https://console.groq.com)
2. Go to **API Keys → Create API Key**
3. Copy the key into `GROQ_API_KEY`

### Getting Upstash Redis Credentials
1. Sign up at [console.upstash.com](https://console.upstash.com) (free tier — no credit card)
2. Click **Create Database**
   - Name: `cyberguard`
   - Type: **Regional**
   - Region: pick the closest to your location
3. On the database page, scroll to the **Connect → REST** tab
4. Click the **👁 eye icon** to reveal the token
5. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into `.env.local`

> **Note:** Without Redis credentials the app runs normally using in-memory fallbacks for rate limiting and caching. Redis is recommended for production.

---

## 3. Database Setup

> **Two naming conventions, on purpose.** The core app tables (`Threat`, `RiskAnalysis`,
> `Incident`, `Playbook`, `Report`, `DashboardMetric`) are modeled in `prisma/schema.prisma`
> — PascalCase table names, camelCase columns — but there's no `DATABASE_URL` configured, so
> `prisma migrate`/`db push` is never actually run; the schema below creates matching tables
> by hand in Supabase's SQL editor instead. Everything else the app queries directly via the
> Supabase client (`profiles`, `assets`, `audit_logs`, `data_source_configs`, `agent_jobs`) is
> plain Supabase, lowercase `snake_case`. Quoted identifiers (`"threatId"`) are required below
> to preserve camelCase in Postgres — omitting the quotes would silently fold it to lowercase.

### Create Tables in Supabase

Go to your Supabase project → **SQL Editor** and run:

```sql
-- ============================================================
-- Prisma-modeled tables (see prisma/schema.prisma) — created by
-- hand here since DATABASE_URL isn't configured for `prisma db push`.
-- ============================================================

create table "Threat" (
  id text primary key default gen_random_uuid()::text,
  "threatId" text unique not null,
  type text not null,
  severity text not null check (severity in ('critical','high','medium','low')),
  source text not null,
  target text not null,
  detected text not null,
  status text not null check (status in ('active','mitigating','blocked','quarantined','isolated','resolved')),
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);
create index on "Threat" (severity);
create index on "Threat" (status);
create index on "Threat" (detected);

create table "RiskAnalysis" (
  id text primary key default gen_random_uuid()::text,
  asset text unique not null,
  "riskLevel" integer not null check ("riskLevel" between 0 and 100),
  vulnerabilities integer not null default 0,
  "exposureTime" text not null,
  recommendation text not null,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);
create index on "RiskAnalysis" ("riskLevel");

create table "Incident" (
  id text primary key default gen_random_uuid()::text,
  "incidentId" text unique not null,
  title text not null,
  description text not null,
  severity text not null check (severity in ('critical','high','medium','low')),
  status text not null default 'open' check (status in ('open','in-progress','resolved','closed')),
  assignee text not null,
  created text not null,
  updated text not null,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);
create index on "Incident" (severity);
create index on "Incident" (status);
create index on "Incident" (created);

create table "Playbook" (
  id text primary key default gen_random_uuid()::text,
  "playbookId" text unique,
  title text not null,
  description text not null,
  category text not null,
  steps integer default 0,
  content jsonb default '{}'::jsonb,
  "updatedBy" text,
  "lastUpdated" text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);
create index on "Playbook" (category);

create table "Report" (
  id text primary key default gen_random_uuid()::text,
  "reportId" text unique,
  title text not null,
  type text not null check (type in ('security','compliance','threat','incident','executive')),
  status text not null default 'in_progress' check (status in ('completed','in_progress','final','generating','pending')),
  content jsonb,
  "jobId" text,
  generated text not null,
  threats integer default 0,
  resolved integer default 0,
  download text,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);
create index on "Report" (type);
create index on "Report" (status);
create index on "Report" (generated);

-- Modeled in prisma/schema.prisma but not currently queried by any live
-- code — getDashboardMetrics() in src/lib/db.ts computes everything
-- on-the-fly from Threat/Incident/RiskAnalysis instead. Kept for parity.
create table "DashboardMetric" (
  id text primary key default gen_random_uuid()::text,
  "threatsDetected" integer default 0,
  "threatsDetectedChange" integer default 0,
  "riskScore" integer default 0,
  "riskScoreChange" integer default 0,
  "incidentsActive" integer default 0,
  "incidentsActiveChange" integer default 0,
  "systemsMonitored" integer default 0,
  "systemsMonitoredChange" integer default 0,
  "updatedAt" timestamptz default now()
);

-- ============================================================
-- Plain Supabase tables (not Prisma-managed)
-- ============================================================

-- Profiles (extends Supabase auth.users)
-- Note: role is a native Postgres enum, not text+CHECK — Supabase's table
-- editor auto-creates one when you pick "Custom" > select-of-values for a
-- new column, which is how this project's `role` column ended up typed.
create type user_role as enum ('admin', 'analyst', 'manager', 'viewer');

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role user_role not null default 'analyst',
  avatar_url text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
```

**If your `profiles.role` enum already existed without `'viewer'`** (true for any install predating v3.5.0), add the missing value once — this cannot run inside a larger transaction block, so execute it as its own statement in the SQL editor:

```sql
alter type user_role add value if not exists 'viewer';
```

```sql
-- Asset inventory (Admin Panel)
create table assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  ip_address text,
  os text,
  criticality text not null check (criticality in ('CRITICAL','HIGH','MEDIUM','LOW')),
  network_exposure text check (network_exposure in ('internet-facing','internal','air-gapped')),
  owner text,
  active boolean default true,
  created_at timestamptz default now(),
  last_seen timestamptz
);

-- Admin action audit trail
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  user_email text,
  action text not null,
  target_id text,
  target_type text,
  details jsonb,
  created_at timestamptz default now()
);

-- Threat-feed integration toggles (Admin Panel → Data Sources)
create table data_source_configs (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  enabled boolean default true,
  api_key text,
  updated_at timestamptz default now(),
  updated_by uuid references auth.users
);

-- AI pipeline job tracking. Note: currently a no-op in practice — the only
-- live code path (src/app/api/threats/job/route.ts) UPDATEs a row here on
-- completion, but nothing live ever INSERTs one first (the code that did,
-- src/lib/route.ts, isn't imported anywhere). Job state that actually drives
-- the UI lives in the Python AI service's Redis-backed store instead
-- (.agents/job_store.py). Kept here for forward-compatibility.
create table agent_jobs (
  job_id text primary key,
  status text not null default 'queued',
  created_at timestamptz default now(),
  completed_at timestamptz,
  indicators_count integer default 0,
  assets_count integer default 0
);
```

### Table Reference

| Table | Purpose |
|---|---|
| `"Threat"` | Security threat indicators |
| `"RiskAnalysis"` | Asset risk assessments |
| `"Incident"` | Tracked security incidents |
| `"Playbook"` | Response procedures |
| `"Report"` | Generated security reports |
| `"DashboardMetric"` | Modeled in Prisma, not currently queried live |
| `profiles` | User profiles and roles |
| `assets` | Asset inventory (Admin Panel) |
| `audit_logs` | Admin action audit trail |
| `data_source_configs` | Threat-feed integration toggles (Admin Panel) |
| `agent_jobs` | AI pipeline job tracking (not currently populated — see note above) |

### User Roles & Permissions

| Role | Access |
|---|---|
| `admin` | Full system access + Admin Panel |
| `manager` | Full operational access (no Admin Panel) |
| `analyst` | Threat and incident management |
| `viewer` | Read-only access + can run the AI analysis pipeline; no delete/manage rights |

---

## 4. Run Development Server

```bash
pnpm run dev
# App runs at http://localhost:3000
```

Expected startup output when everything is configured correctly:

```
[Env] Loaded .env.local
[Redis] Connected to Upstash Redis
> Server ready on http://localhost:3000
> Socket.io ready on ws://localhost:3000/api/socket
```

### First-time login
1. Navigate to `http://localhost:3000`
2. Click **Get Started** or go directly to `/login`
3. Register a new account with your email
4. Check email for the Supabase confirmation link
5. After confirming, you'll be logged in with the **analyst** role by default
6. To promote yourself to **admin**, update your profile row in Supabase:
   ```sql
   update profiles set role = 'admin' where id = '<your-user-id>';
   ```

---

## 5. Production Deployment (Vercel)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Add all `.env.local` variables in **Environment Variables**
4. Deploy — Vercel auto-detects Next.js

```env
# Production environment variables (add in Vercel dashboard)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GROQ_API_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Available npm Scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build production bundle |
| `pnpm run start` | Start production server |
| `pnpm run lint` | Run ESLint |
| `pnpm test` | Run the Vitest suite (`src/lib/*.test.ts`) |
| `pnpm run db:init` | Validate that all required Supabase tables exist and are reachable |
| `pnpm run db:seed` | Seed `Threat`/`RiskAnalysis`/`Incident`/`Playbook`/`Report` with sample rows |
| `pnpm run db:setup` | Runs `db:init` then `db:seed` |
| `pnpm run db:test` | Quick connectivity check against the `Threat` table |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Module not found` errors | Run `pnpm install` again |
| Supabase 401/403 errors | Check `SUPABASE_SERVICE_ROLE_KEY` is correct |
| AI pipeline hangs | Verify `GROQ_API_KEY` is valid |
| Socket.io not connecting | Make sure only one dev server is running on port 3000 |
| "System Degraded" shown | The AI agent health check endpoint is unreachable — normal if backend Python service is not running |
| `[Redis] No Upstash credentials` | Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local` — app works without them using in-memory fallback |
| Redis 401 Unauthorized | Token is incorrect or truncated — re-copy the full token from the Upstash REST tab (click the 👁 eye icon to reveal it) |
| Rate limits not persisting | Redis credentials missing or invalid — rate limit state resets on server restart when using in-memory fallback |
