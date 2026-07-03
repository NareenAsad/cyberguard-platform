# Real-Time Documentation (docs/WEBSOCKET.md)

> **v3.4.0 — Updated July 2026**
> CyberGuard uses a **dual real-time system**: Socket.io for continuous live dashboard
> updates, and a Custom Browser Event for instant post-pipeline page refreshes.

---

## 1. Socket.io — Continuous Live Updates

### Architecture

```text
server.js (Node.js + Socket.io Server)
        │
        │  path: /api/socket
        │  transports: websocket, polling
        │
        ├── Every 10 s  →  chart:update       →  ThreatChart appends new data point
        ├── Every 30 s  →  metrics:update      →  Metric cards + sidebar timestamp refresh
        ├── On connect  →  metrics:update      →  New client gets immediate snapshot
        │
        └── On AI pipeline complete / critical threat / critical incident
            (via POST /api/internal/socket-emit, see src/lib/socket/emit-socket-event.ts)
                        →  metrics:update      →  Refreshed metric values
                        →  page:refresh        →  Triggers router.refresh() on target page
                        →  alert:new           →  Header notification bell (NotificationBell)
```

> Note: `threats:new` / `incidents:update` client listeners exist in `src/lib/socket/socket.ts` but nothing server-side currently emits them. Only `metrics:update`, `chart:update`, `page:refresh`, and `alert:new` are real.

### Server (server.js)

```js
const io = new Server(httpServer, {
    path: '/api/socket',
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
})

io.on('connection', (socket) => {
    // Push current metrics snapshot immediately to new client
    socket.emit('metrics:update', generateMetrics())
})

// Chart update every 10 s
setInterval(() => io.emit('chart:update', generateChartPoint()), 10_000)

// Metrics update every 30 s
setInterval(() => io.emit('metrics:update', generateMetrics()), 30_000)
```

### Client Singleton (src/lib/socket/socket.ts)

```typescript
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocket(): Socket {
    if (!socket) {
        socket = io({
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        })
    }
    return socket
}

// Typed subscription helpers (each returns an unsubscribe fn)
export const onMetricsUpdate  = (cb) => { ... }
export const onChartUpdate    = (cb) => { ... }
export const onNewThreat      = (cb) => { ... }  // defined, but nothing server-side emits threats:new
export const onIncidentUpdate = (cb) => { ... }  // defined, but nothing server-side emits incidents:update
export const onPageRefresh    = (cb) => { ... }
export const onAlert          = (cb) => { ... }  // 'alert:new' — powers the Header NotificationBell
```

### React Hooks (src/hooks/use-socket-events.ts)

| Hook | Subscribed event | Used by |
|---|---|---|
| `useSocketMetrics()` | `metrics:update` | Dashboard metric cards |
| `useSocketChartData()` | `chart:update` | ThreatChart |
| `useSocketIncidents()` | `incidents:update` | Recent Incidents list (event never actually fires — see note above) |
| `useSocketConnection()` | `connect` / `disconnect` | Connection status |

The notification bell (`src/components/layout/notification-bell.tsx`) doesn't use a hook — it calls `onAlert()` directly in a `useEffect`.

---

## 2. Real-Time Monitoring Toggle

The dashboard includes a **Real-Time Monitoring** toggle (`src/components/dashboard/realtime-toggle.tsx`) that lets any authenticated user (admin, manager, analyst) pause Socket.io-driven updates.

| State | Behaviour |
|---|---|
| **LIVE** (default, cyan pulsing dot) | Socket.io events drive all metric cards, chart, and incidents list |
| **Paused** (grey) | Dashboard freezes at last data snapshot; Socket stays connected but updates are suppressed — safe to review AI pipeline output |

The toggle does **not** disconnect the socket — it only gates whether the UI state is updated from incoming events.

**Persistence & cross-component sync** (`src/lib/realtime-toggle-events.ts`): the paused state is written to `localStorage` (`cyberguard:realtime-enabled`) so it survives a page refresh, and a custom `cyberguard:realtime-toggle` window event notifies other already-mounted components immediately when it changes — without this, the toggle used to silently reset to LIVE on every refresh. The Sidebar's "Last Update" timestamp subscribes to the same state so it freezes too when paused, instead of continuing to tick from live socket updates while the rest of the dashboard is frozen.

---

## 3. Custom Browser Event — `ai-analysis:completed`

Used specifically to signal the end of the AI pipeline. Dispatched client-side only (no cross-tab propagation).

### Flow

```text
RunAnalysisButton polls GET /api/threats/job
        │
        │  status === "completed"
        │
        └─► window.dispatchEvent(new CustomEvent('ai-analysis:completed'))
                    │
                    ├── usePageRefresh hook  →  router.refresh() on threats, risk-analysis,
                    │                           incident-response, playbooks, reports pages
                    │
                    └── Sidebar             →  "Last Update" timestamp refreshes
```

### Dispatch (producer)

```typescript
// src/components/dashboard/run-analysis-button.tsx — line 124
window.dispatchEvent(new CustomEvent('ai-analysis:completed'))
```

### Consumer — usePageRefresh hook

```typescript
// src/hooks/use-page-refresh.ts
window.addEventListener('ai-analysis:completed', () => router.refresh())
```

### Consumer — Sidebar

```typescript
// src/components/layout/sidebar.tsx
window.addEventListener('ai-analysis:completed', updateNow)  // always updates — explicit user action
onMetricsUpdate(() => {
    if (realtimeEnabledRef.current) updateNow()  // only on live socket ticks, gated by the pause toggle
})
```

---

## 4. Notification Bell (`alert:new`)

The Header's notification bell (`src/components/layout/notification-bell.tsx`) is in-memory only — it holds whatever `alert:new` events arrived since the tab was opened, with no history fetched or persisted server-side. Each notification tracks its own read/unread state (a filled dot to the right of a row toggles it); "Mark all read" and "Clear all" act on the whole list.

### Emission points (`src/lib/socket/emit-socket-event.ts` → `emitAlert()`)

| Trigger | Where | Severity |
|---|---|---|
| AI analysis pipeline finishes saving results | `src/app/api/threats/job/route.ts` (`emitRefreshEvents`) | `critical` if any critical-severity finding, else `info` |
| A threat saved by the AI pipeline is classified `critical` | `src/app/api/threats/job/route.ts` (`saveAndNotify`, per-threat) | `critical` |
| An incident saved by the AI pipeline is classified `critical` | `src/app/api/threats/job/route.ts` (`saveAndNotify`, per-incident) | `critical` |
| An analyst manually creates an incident with `severity: "critical"` | `src/app/api/incident-response/route.ts` (`POST`) | `critical` |

---

## 5. Redis Metrics Persistence

Live dashboard metrics pushed via Socket.io (`metrics:update`) are also written to Redis under
the key `realtime:metrics` with a **24-hour TTL**. On server restart, the last known values
are restored from Redis so the dashboard never resets to zero.

---

> For the full list of API endpoints (including the AI pipeline polling endpoint), see the [API Reference](./API.md).
