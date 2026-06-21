# Backend Documentation (docs/BACKEND.md)

> **v3.2.0 — Updated June 2026**

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
- Admin-only routes enforce RBAC by checking the user's role (`admin`, `manager`, `analyst`, `viewer`).

---

## Error Handling

- Every `POST` endpoint validates required fields and returns `400 Bad Request` with a JSON error payload on validation failure.
- All database calls are wrapped in `try/catch`; on failure the server returns a generic error and logs the exception.

---

## AI Pipeline (Run AI Analysis)

- Triggered via `POST /api/threats`.
- Runs **five sequential CrewAI agents** powered by Groq (`llama-3.3-70b-versatile`):
  1. **Threat Intelligence Agent** — enriches indicators via OSINT.
  2. **Vulnerability Assessment Agent** — maps CVEs to assets.
  3. **Risk Scoring Agent** — calculates criticality.
  4. **Incident Response Agent** — suggests containment steps.
  5. **Reporting Agent** — produces an executive summary.
- The frontend polls job status using `GET /api/threats/job?jobId=<id>` until `status === "completed"`.
- On completion, the server is notified via `POST /api/internal/socket-emit` which broadcasts Socket.io events (`threats:new`, `metrics:update`, `page:refresh`) to all connected clients.

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

The `RealtimeToggle` component (`src/components/dashboard/realtime-toggle.tsx`) allows users to pause Socket.io-driven updates. When paused, data freezes at the last snapshot — ideal for reviewing AI analysis results without live metrics changing.

> For the full event architecture and code examples, see the [Real-Time Documentation](./WEBSOCKET.md).

---

## Metrics Persistence (Redis)

Live dashboard metrics (threat count, risk score, active incidents) are stored in Redis under the key `realtime:metrics` with a **24-hour TTL** (`server.js`). This means simulated values survive server restarts. If Redis credentials are not configured, metrics are held in memory only.

---

> For a full list of endpoints, see the [API Documentation](./API.md).
