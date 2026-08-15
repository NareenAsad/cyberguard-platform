# Database Documentation (docs/DATABASE.md)

CyberGuard uses **Supabase** (managed PostgreSQL) as its primary data store. Row Level Security (RLS) is enabled on every table below, with zero policies attached — meaning `anon`/`authenticated` are default-denied entirely. All application reads/writes go through Next.js API routes using the service-role client, which bypasses RLS by design; RLS here exists purely to stop direct access via Supabase's REST API using the public anon key (which ships in every page load), not to gate the app's own queries.

## Tables Overview

> Two naming conventions, on purpose — see `docs/SETUP.md` for why. `Threat`/`RiskAnalysis`/`Incident`/`Playbook`/`Report` are PascalCase with camelCase columns (Prisma-modeled, created by hand); everything else is plain lowercase `snake_case` Supabase.

| Table | Purpose | Key Columns |
|---|---|---|
| `"Threat"` | Stores identified threat indicators and metadata | `threatId`, `severity`, `status`, `source`, `target` |
| `"RiskAnalysis"` | Contains asset risk assessments and vulnerability data | `asset`, `riskLevel (0–100)`, `vulnerabilities`, `exposureTime` |
| `"Incident"` | Tracks security incidents and their management lifecycle | `incidentId`, `title`, `severity`, `status`, `assignee` |
| `"Playbook"` | Stores incident response procedures and steps | `playbookId`, `title`, `category`, `content (jsonb)` |
| `"Report"` | Generated security, compliance, and threat reports | `reportId`, `type`, `status`, `content (jsonb, opaque-encoded)` |
| `"DashboardMetric"` | Modeled in Prisma but not currently queried live — the dashboard computes metrics on the fly from `Threat`/`Incident`/`RiskAnalysis` instead | — |
| `profiles` | Extends `auth.users` with application-specific metadata | `id`, `full_name`, `role`, `avatar_url` |
| `assets` | Organizational asset inventory (Admin Panel) | `name`, `type`, `criticality`, `network_exposure` |
| `audit_logs` | Append-only admin action audit trail | `action`, `target_id`, `target_type`, `details (jsonb)` |
| `data_source_configs` | Threat-feed integration toggles (Admin Panel → Data Sources) | `key`, `enabled`, `api_key (AES-256-GCM encrypted)` |
| `notifications` | Shared, system-wide feed for the header notification bell — no per-user ownership | `type`, `title`, `message`, `severity`, `read` |
| `agent_jobs` | AI pipeline job tracking — not currently populated; live job state lives in the Python service's Redis-backed store instead | `job_id`, `status` |

## Roles and Access Control

Access control is enforced via RLS (default-deny for direct Supabase access), Next.js middleware (session + route-level role checks), and per-endpoint permission guards (`requirePermission()`, checked against `ROLE_PERMISSIONS`).

| Role | Access Level |
|---|---|
| `admin` | **Full Access**: Can manage users, access all operational data, and use the Admin Panel. |
| `manager` | **Operational Management**: Can read and write all operational data but cannot access the Admin Panel. |
| `analyst` | **Security Operations**: Can read and write threats, incidents, and playbooks. |
| `viewer` | **Read-Only + Pipeline**: Can view all operational data and trigger the AI analysis pipeline, but cannot delete data or manage users/settings. Unlimited accounts may hold this role. |

## Graceful Degradation

A core feature of the CyberGuard backend is its resilience. If the Supabase database is unreachable:
1. Every API endpoint automatically falls back to **built-in mock data**.
2. The API response includes a custom header `X-Data-Source: mock`.
3. The UI continues to function without displaying errors to the user, providing a seamless (though non-persistent) experience.

---

> For setup instructions and environment variable configuration, see the [Setup Guide](./SETUP.md).
