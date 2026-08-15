# Backend Documentation (docs/BACKEND.md)

> **v3.7.0 — Updated August 2026**

CyberGuard's backend is implemented entirely with **Next.js API Routes** + a custom **Node.js server** (`server.js`) for Socket.io. No separate API process is required.

---

## Architecture

- All endpoints follow a **DB-first** pattern. If Supabase is reachable, data is fetched from the real database. If not, the endpoint falls back to built-in mock data and adds the HTTP header `X-Data-Source: mock`.
- Requests are **type-safe** with TypeScript definitions.
- **Authentication** is handled via Supabase Auth; the session token is verified on each request.

---

## Security & Rate Limiting

- **Redis-backed sliding-window rate limiting** (`src/lib/rate-limit.ts`) — uses Upstash Redis sorted sets (`ZADD` / `ZREMRANGEBYSCORE` / `ZCARD` pipeline). Clients are keyed by authenticated User ID (preferred) or Client IP. Returns RFC-compliant headers (`Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`). Falls back to an in-memory store if Redis credentials are absent.
- **Redis API response caching** (`src/lib/cache.ts`) — dashboard metrics cached for **30 seconds**; chart data cached for **60 seconds** per `timeRange`. All keys are namespaced under `cg:cache:*` and auto-expire via Redis TTL. Routes return `X-Cache: HIT / MISS` headers.
- **Strict schema validation** (`src/lib/validation.ts`) — centralized Zod layer covering all public and admin route payloads. Enforces types, strict structures, limits, and rejects unknown fields via `.strict()`.
- **XSS / input sanitization** — string fields are sanitized and HTML-escaped before processing or storage.
- **Parameterized statements** — all Supabase queries use parameterized calls to prevent SQL injection.
- Admin-only routes enforce RBAC by checking the user's role (`admin`, `manager`, `analyst`, `viewer`) via `requirePermission(permission)` (`src/lib/auth/require-delete-permission.ts`), a generalized server-side guard checked against `ROLE_PERMISSIONS` — e.g. `PATCH /api/incident-response` requires `canAssignIncidents`, `DELETE` routes require `canDeleteData`.
- **Service-to-service auth** — the Next.js backend and the FastAPI AI microservice (`.agents/main.py`) authenticate each other with a shared `AGENT_API_SECRET`, sent as an `x-api-key` header on every request from `src/lib/agent-client.ts` and checked via a FastAPI dependency on all `/api/agents/*` routes. Requests without a matching key are rejected with 401.
- **Internal webhook auth** — `server.js`'s internal Socket.io bridge (`POST /api/internal/socket-emit`) requires a matching `INTERNAL_WEBHOOK_SECRET` via an `x-internal-secret` header (`src/lib/socket/emit-socket-event.ts`), instead of trusting any caller that can reach localhost.
- **Locked-down CORS** — both `server.js`'s Socket.io server and the FastAPI service now allow only `NEXT_PUBLIC_APP_URL` (falling back to `http://localhost:3000`), replacing a wildcard `origin: '*'`.
- **Opaque content at rest** (`src/lib/opaque-content.ts`) — `Report.content` and `Playbook.content` are base64-wrapped (`{__b64: true, data}`) before being written to Supabase. Root cause: Supabase's Cloudflare edge returned a WAF "Attention Required" challenge page instead of a JSON response for POST bodies whose raw JSON contained attack-pattern-looking text — which AI-generated remediation commands, detection rules, and IOC values frequently do. Wrapping the JSON as base64 keeps literal trigger strings out of the raw request body; reads transparently decode via `decodeReportContent` / `decodePlaybookContent`, falling back to the plain object for rows written before this existed.
- **Encryption at rest** (`src/lib/crypto.ts`) — third-party data-source API keys (NVD, OTX, Shodan, etc., entered in Admin → Data Sources) are AES-256-GCM encrypted with `DATA_SOURCE_ENCRYPTION_KEY` before being written to `data_source_configs.api_key`; the GET route never selects that column back to the client either.
- **Row Level Security** — every application table has RLS enabled with zero policies (default-deny for `anon`/`authenticated`). The service-role client every API route uses bypasses RLS as intended; this only stops someone from reading/writing these tables directly through Supabase's REST API using the public anon key, which ships in every page load. See `docs/SETUP.md` for the exact `alter table ... enable row level security` statements.
- **Bot protection** (`src/lib/turnstile.ts`, `src/components/auth/turnstile-widget.tsx`) — Cloudflare Turnstile gates `login()` and `signup()` in `src/lib/auth/actions.ts`; the token is verified server-side via Cloudflare's `siteverify` endpoint before either action touches Supabase Auth. Fails open in development when `TURNSTILE_SECRET_KEY` is unset, fails closed in production.
- **Login throttling** (`src/lib/auth/actions.ts`) — `login()` rate-limits by both IP and the attempted email address independently (`rateLimitKey`, a lower-level primitive split out of `rate-limit.ts` for Server Actions, which don't receive a `NextRequest`), on top of the general per-endpoint limiter used by API routes.
- **Debug endpoint lockdown** — `/api/test-db` (a diagnostic route using the service-role client to dump row counts across every table) now requires the `admin` role; previously any authenticated user could call it.
- **Notification feed authorization** — `/api/notifications` has no per-user ownership (it's a shared, system-wide feed), so `POST`, single-item `DELETE`, and clear-all `DELETE` all require `canDeleteData`; only `GET` and marking read (`PATCH`) are open to any authenticated role.
- **Delete confirmation** (`src/components/ui/delete-confirm-dialog.tsx`) — every destructive UI action (reports, incidents, playbooks, notifications) requires an explicit confirm dialog before the delete request fires; previously these fired immediately on click with no way to undo.
- **Dependency scanning** — `.github/dependabot.yml` covers the npm workspace and the Python service (`.agents/`) on a weekly schedule. Dependabot alerts/security updates still need to be enabled once in the repo's GitHub settings (`Settings → Code security and analysis`) — the config file alone only adds version-bump PRs, not vulnerability scanning.

---

## Error Handling

- Every `POST` endpoint validates required fields and returns `400 Bad Request` with a JSON error payload on validation failure.
- All database calls are wrapped in `try/catch`; on failure the server returns a generic error and logs the exception.

---

## AI Pipeline (Run AI Analysis)

- Triggered via `POST /api/threats`.
- Runs **five sequential CrewAI agents** powered by Anthropic's Claude (`claude-haiku-4-5-20251001`):
  1. **Threat Intelligence Agent** — enriches indicators via OSINT (NVD, OTX, full MITRE ATT&CK Enterprise matrix — 697 techniques).
  2. **Vulnerability Assessment Agent** — maps CVEs to assets.
  3. **Risk Scoring Agent** — calculates criticality.
  4. **Incident Response Agent** — suggests containment steps.
  5. **Reporting Agent** — produces an executive summary.
- The frontend polls job status using `GET /api/threats/job?jobId=<id>` until `status === "completed"`. The job status payload includes `current_step` (0–5), incremented by `task_callback` as each CrewAI task finishes and written to the job store — the dashboard's per-agent progress indicators reflect this real backend progress instead of a client-side timer estimate.
- On completion, the server is notified via `POST /api/internal/socket-emit` (now requiring a matching `x-internal-secret` header, see Security above) which broadcasts Socket.io events (`metrics:update`, `page:refresh`, `alert:new`) to all connected clients. `alert:new` also fires per-item when a threat or incident the pipeline saves is classified `critical` — see [Notification Bell](./WEBSOCKET.md#4-notification-bell-alertnew).
- On save, `Threat`, `RiskAnalysis`, `Incident`, and `Playbook` rows are inserted with a single bulk `.insert([...])` call per table instead of one round-trip per row. Before inserting fresh `RiskAnalysis` rows, existing rows for the same asset names are deleted first, since the dashboard's "Run Analysis" button re-submits the same asset inventory on every run and would otherwise hit the table's unique constraint on repeat runs.

### Job persistence & rate-limit resilience (`.agents/`)

- **Job state** (`.agents/job_store.py`) is persisted to the same Upstash Redis instance the Node app uses (24h TTL), not held in an in-memory dict — job status/results survive a service restart or redeploy. Falls back to in-memory automatically if Redis credentials are absent. `job_store` is imported only after `load_dotenv()` runs in `crew.py`/`main.py`, since its module-level `JobStore()` singleton reads the Upstash env vars at import time — importing it earlier silently falls back to the in-memory store.
- **Retry behavior** (`.agents/crew.py`): if the LLM provider rate-limits a call partway through the 5-task pipeline, the pipeline retries with backoff (up to 4 attempts) rather than failing outright; each retry currently restarts `kickoff()` from task 1.
- **Two LLM instances**: `self.llm` (max 4096 output tokens) drives the tool-calling agents; `self.llm_powerful` (max 32000 output tokens) drives the two large single-shot JSON agents (playbooks, comprehensive report) — raised from a lower cap after both were observed landing exactly on the token limit and silently truncating mid-JSON.
- **Token usage logging**: each task logs its own token cost (summed across both LLM instances), and each run logs/returns a `token_usage` summary (`total_tokens`, `prompt_tokens`, `completion_tokens`, `successful_requests`) in the pipeline result's `metadata`, visible in the FastAPI service logs.

---

## Real-Time Updates

CyberGuard uses a **dual real-time system**:

### 1. Socket.io — Continuous Broadcasts

The custom `server.js` runs a Socket.io server on path `/api/socket`:

| Broadcast | Interval | Payload |
|---|---|---|
| `metrics:update` | Every 30 s + on connect | Threat count, risk score, active incidents, systems monitored |
| `chart:update` | Every 10 s | `{ name, threats, detected, timestamp }` |

Client hooks (`useSocketMetrics`, `useSocketChartData`, `useSocketIncidents` in `src/hooks/use-socket-events.ts`) subscribe to these events and update React state, driving live dashboard updates.

### 2. Custom Browser Event — Post-Pipeline Refresh

When `GET /api/threats/job` returns `status: "completed"`, `RunAnalysisButton` dispatches:

```typescript
window.dispatchEvent(new CustomEvent('ai-analysis:completed'))
```

The `usePageRefresh` hook responds by calling `router.refresh()`, which re-runs Next.js Server Components and pulls fresh data from Supabase.

### 3. Real-Time Monitoring Toggle

The `RealtimeToggle` component (`src/components/dashboard/realtime-toggle.tsx`) allows users to pause Socket.io-driven updates. When paused, data freezes at the last snapshot — ideal for reviewing AI analysis results without live metrics changing. The paused state persists across refreshes (`localStorage`) and is shared with the Sidebar's "Last Update" timestamp, which freezes too when paused (see [WEBSOCKET.md](./WEBSOCKET.md#2-real-time-monitoring-toggle)).

> For the full event architecture and code examples, see the [Real-Time Documentation](./WEBSOCKET.md).

---

## Metrics Persistence (Redis)

Live dashboard metrics (threat count, risk score, active incidents) are stored in Redis under the key `realtime:metrics` with a **24-hour TTL** (`server.js`). This means simulated values survive server restarts. If Redis credentials are not configured, metrics are held in memory only.

---

> For a full list of endpoints, see the [API Documentation](./API.md).
