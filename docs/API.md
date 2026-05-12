# 📡 CyberGuard — API Reference

All API routes live under `/src/app/api/`. They follow a **DB-first with mock fallback** pattern — if Supabase is unreachable, the app returns mock data with an `X-Data-Source: mock` header so the UI never breaks.

---

## Authentication

Most API routes require an active Supabase session. The client sends the session cookie automatically. The API reads it via:

```typescript
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## Endpoints

### Dashboard

#### `GET /api/dashboard/metrics`
Returns aggregated security metrics.

**Response:**
```json
{
  "threats_detected": 142,
  "risk_score": 73,
  "incidents_active": 8,
  "systems_monitored": 247,
  "timestamp": "2026-05-12T06:00:00Z"
}
```

---

#### `GET /api/dashboard/chart-data`
Returns time-series threat counts for the chart.

**Query params:**
| Param | Values | Default |
|---|---|---|
| `range` | `24h`, `7d`, `30d` | `24h` |

**Response:**
```json
[
  { "name": "00:00", "threats": 4 },
  { "name": "02:00", "threats": 7 }
]
```

---

### Threats

#### `GET /api/threats`
List all threats with optional filters.

**Query params:**
| Param | Example | Description |
|---|---|---|
| `severity` | `high` | Filter by severity |
| `status` | `active` | Filter by status |
| `page` | `1` | Page number |
| `limit` | `20` | Results per page |

---

#### `POST /api/threats`
Trigger the AI analysis pipeline.

**Body:**
```json
{
  "indicators": [
    { "type": "cve", "value": "CVE-2021-44228", "source": "NVD", "confidence": 100 }
  ],
  "assets": [
    { "id": "asset-001", "name": "Web Server", "ip_address": "10.0.1.10", "criticality": "CRITICAL" }
  ]
}
```

**Response:**
```json
{ "job_id": "abc123" }
```

---

#### `GET /api/threats/job?jobId=abc123`
Poll the status of an AI pipeline job.

**Response:**
```json
{
  "job": {
    "status": "completed",
    "result": {
      "executive_report": {
        "posture_score": 62,
        "severity_summary": { "critical": 1, "high": 3, "medium": 5 },
        "top_risk": "Log4Shell exploitation on production server",
        "action_required": "Patch Apache Log4j immediately"
      }
    }
  }
}
```

---

### Risk Analysis

#### `GET /api/risk-analysis`
List all asset risk assessments.

**Query params:**
| Param | Example | Description |
|---|---|---|
| `minRisk` | `50` | Minimum risk level (0–100) |
| `maxRisk` | `90` | Maximum risk level |
| `sortBy` | `riskLevel` | Sort field |

---

### Incident Response

#### `GET /api/incident-response`
List incidents.

**Query params:**
| Param | Example | Description |
|---|---|---|
| `status` | `active` | Filter by status |
| `severity` | `critical` | Filter by severity |

---

#### `POST /api/incident-response`
Create a new incident.

**Body:**
```json
{
  "title": "Ransomware detected on DB server",
  "description": "...",
  "severity": "critical",
  "assignee": "Ana"
}
```

**Validation:** `title` and `severity` are required. Returns `400` if missing.

---

### Playbooks

#### `GET /api/playbooks`
List response playbooks.

**Query params:**
| Param | Example | Description |
|---|---|---|
| `category` | `malware` | Filter by category |
| `search` | `ransomware` | Full-text search |

---

### Reports

#### `GET /api/reports`
List security reports.

**Query params:**
| Param | Example | Description |
|---|---|---|
| `type` | `security` | Filter by type |
| `status` | `completed` | Filter by status |

---

#### `POST /api/reports`
Generate a new report.

**Body:**
```json
{
  "title": "Monthly Security Summary",
  "type": "security"
}
```

---

## WebSocket Events (Socket.io)

Connect to the socket at the same origin. The server emits these events:

| Event | Direction | Payload | Description |
|---|---|---|---|
| `metrics:update` | Server → Client | `{ updatedAt }` | Metrics refreshed |
| `chart:update` | Server → Client | — | Chart data changed |
| `threats:new` | Server → Client | `{ indicator_value }` | New threat detected |
| `incidents:update` | Server → Client | `{ cve_id, id }` | Incident changed |
| `agent:complete` | Server → Client | `{ job_id }` | AI pipeline done |

**Client usage:**
```typescript
import { initSocket } from '@/lib/socket/socket'

const socket = initSocket()
socket.on('threats:new', (data) => {
  console.log('New threat:', data.indicator_value)
})
```

---

## Error Responses

| Status | Meaning |
|---|---|
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — no active session |
| `403` | Forbidden — insufficient role |
| `404` | Not Found |
| `500` | Internal Server Error |

All errors return: `{ "error": "Human readable message" }`
