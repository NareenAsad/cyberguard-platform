# Database Documentation (docs/DATABASE.md)

CyberGuard uses **Supabase** (managed PostgreSQL) as its primary data store. The application implements Row Level Security (RLS) to ensure data integrity and security.

## Tables Overview

| Table | Purpose | Key Columns |
|---|---|---|
| `profiles` | Extends `auth.users` with application-specific metadata | `id`, `full_name`, `role`, `avatar_url` |
| `threats` | Stores identified threat indicators and metadata | `title`, `severity`, `status`, `source`, `indicator_value` |
| `risk_analyses` | Contains asset risk assessments and vulnerability data | `asset`, `risk_level (0–100)`, `vulnerabilities`, `exposure_time` |
| `incidents` | Tracks security incidents and their management lifecycle | `title`, `severity`, `status`, `assignee` |
| `playbooks` | Stores incident response procedures and steps | `title`, `category`, `steps (jsonb)` |
| `reports` | Metadata for generated security and compliance reports | `type`, `status`, `threats_count`, `resolved_count` |
| `dashboard_metrics` | Aggregated statistics for the main dashboard | `threats_detected`, `risk_score`, `incidents_active`, `systems_monitored` |

## Roles and Access Control

Access control is enforced via Supabase RLS and application-level middleware.

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
