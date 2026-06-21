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

### Create Tables in Supabase

Go to your Supabase project → **SQL Editor** and run:

```sql
-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'analyst' check (role in ('admin','analyst','manager','viewer')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Threats
create table threats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity text check (severity in ('critical','high','medium','low')),
  status text default 'active' check (status in ('active','investigating','resolved')),
  source text,
  indicator_value text,
  created_at timestamptz default now()
);

-- Risk Analyses
create table risk_analyses (
  id uuid primary key default gen_random_uuid(),
  asset text not null,
  risk_level integer check (risk_level between 0 and 100),
  vulnerabilities integer default 0,
  exposure_time text,
  created_at timestamptz default now()
);

-- Incidents
create table incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text check (severity in ('critical','high','medium','low')),
  status text default 'open' check (status in ('open','investigating','resolved','closed')),
  assignee text,
  created_at timestamptz default now()
);

-- Playbooks
create table playbooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  steps jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('security','compliance','threat','incident')),
  status text default 'in_progress' check (status in ('completed','in_progress')),
  threats_count integer default 0,
  resolved_count integer default 0,
  created_at timestamptz default now()
);

-- Dashboard Metrics
create table dashboard_metrics (
  id uuid primary key default gen_random_uuid(),
  threats_detected integer default 0,
  risk_score integer default 0,
  incidents_active integer default 0,
  systems_monitored integer default 0,
  created_at timestamptz default now()
);
```

### Table Reference

| Table | Purpose |
|---|---|
| `profiles` | User profiles and roles |
| `threats` | Security threat indicators |
| `risk_analyses` | Asset risk assessments |
| `incidents` | Tracked security incidents |
| `playbooks` | Response procedures |
| `reports` | Generated security reports |
| `dashboard_metrics` | Aggregated statistics |

### User Roles & Permissions

| Role | Access |
|---|---|
| `admin` | Full system access + Admin Panel |
| `manager` | Full operational access (no Admin Panel) |
| `analyst` | Threat and incident management |
| `viewer` | Read-only dashboard access |

```

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
