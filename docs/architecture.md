# CyberGuard Backend Architecture

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                    │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENTS                                │
│   Dashboard │ Threats │ Risk Analysis │ Incidents │ Playbooks │ Reports │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                   USE FETCH DATA HOOK                                   │
│  • Loading state management                                            │
│  • Error handling                                                      │
│  • Auto-refetch intervals                                             │
│  • Type safety                                                        │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                    API SERVICE LAYER                                    │
│  dashboardAPI │ threatsAPI │ riskAPI │ incidentAPI │ playbooksAPI     │
│  reportsAPI                                                            │
│  (lib/api-service.ts)                                                 │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
                      HTTP GET/POST Requests
                     (with query parameters)
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API ROUTES                                │
│  /api/dashboard/*     /api/threats         /api/risk-analysis         │
│  /api/incident-response  /api/playbooks   /api/reports               │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                              │
│  • Query parameter validation                                         │
│  • Filtering & sorting logic                                         │
│  • Pagination                                                         │
│  • Error handling                                                     │
│  • Response formatting                                               │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│                       DATA SOURCES                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Mock Data    │  │  Real DB     │  │  Cache       │                │
│  │ (Currently) │  │ (PostgreSQL) │  │ (Redis)      │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│  Set via USE_API flag in api-service.ts                              │
└────────────────────────────────────────────────────────────────────────┘
```

## API Routes Organization

```
/app/api/
│
├── dashboard/
│   ├── metrics/
│   │   └── route.ts
│   │       GET /api/dashboard/metrics
│   │       Returns: { dashboardMetrics }
│   │
│   └── chart-data/
│       └── route.ts
│           GET /api/dashboard/chart-data?timeRange=6m
│           Returns: { chartData, timeRange }
│
├── threats/
│   └── route.ts
│       GET /api/threats?severity=critical&status=blocked&page=1&limit=10
│       Returns: { threatData[], total, page, pages, limit }
│
├── risk-analysis/
│   └── route.ts
│       GET /api/risk-analysis?minRisk=50&maxRisk=100&sortBy=riskLevel
│       Returns: { riskData[], total, filters }
│
├── incident-response/
│   └── route.ts
│       GET /api/incident-response?status=in-progress&severity=critical
│       Returns: { incidentData[], total, page, pages, limit }
│       
│       POST /api/incident-response
│       Body: { title, severity, description, ... }
│       Returns: { newIncident }
│
├── playbooks/
│   └── route.ts
│       GET /api/playbooks?category=Incident%20Response&search=ransomware
│       Returns: { playbookData[], total, page, pages, limit }
│
└── reports/
    └── route.ts
        GET /api/reports?type=Monthly%20Summary&status=completed
        Returns: { reportData[], total, page, pages, limit }
        
        POST /api/reports
        Body: { title, type, filters, ... }
        Returns: { newReport }
```

## Data Flow Example: Fetching Threats

```
User clicks "Threats" page
        ↓
React Component renders (<ThreatsPage>)
        ↓
useCallback creates fetch function
        ↓
useFetchData hook called
        ↓
threatsAPI.getThreats({ severity: 'critical' })
        ↓
Builds URL: /api/threats?severity=critical
        ↓
fetch() sends HTTP GET request
        ↓
Next.js Route Handler (/api/threats/route.ts)
        ↓
Receives query parameters
        ↓
Filters mock data (or queries database)
        ↓
Formats response { success: true, data: [...], total: X, page: 1 }
        ↓
HTTP response returned
        ↓
useFetchData parses JSON
        ↓
Updates component state (data, loading, error)
        ↓
Component re-renders with threats data
        ↓
User sees filtered threats list
```

## Component Integration Pattern

```typescript
// 1. Import API service and hook
import { useFetchData } from '@/hooks/use-fetch-data'
import { threatsAPI } from '@/lib/api-service'

// 2. Create fetch callback with useCallback
const threatsCallback = useCallback(
  () => threatsAPI.getThreats({ severity: selectedSeverity }),
  [selectedSeverity]  // Dependencies
)

// 3. Use fetch hook to get data
const { data: threats, loading, error } = useFetchData(threatsCallback, {
  refetchInterval: 30000  // Optional: auto-refresh every 30s
})

// 4. Render based on state
return (
  <>
    {loading && <Skeleton />}
    {error && <Error message={error.message} />}
    {threats && <ThreatsList threats={threats} />}
  </>
)
```

## Response Format Standard

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number
  page?: number
  pages?: number
  limit?: number
}
```

### Success Response Example
```json
{
  "success": true,
  "data": {
    "threatsDetected": 2847,
    "threatsDetectedChange": 12.5,
    "riskScore": 42,
    "riskScoreChange": -3.2,
    "incidentsActive": 8,
    "incidentsActiveChange": 2,
    "systemsMonitored": 156,
    "systemsMonitoredChange": 0
  },
  "timestamp": "2024-03-24T14:32:00.000Z"
}
```

### Paginated Response Example
```json
{
  "success": true,
  "data": [
    {
      "id": "THR-001",
      "type": "Malware",
      "severity": "critical",
      "source": "192.168.1.105",
      "target": "Database Server",
      "detected": "2024-03-24 14:32:00",
      "status": "blocked"
    }
  ],
  "total": 247,
  "page": 1,
  "pages": 25,
  "limit": 10,
  "timestamp": "2024-03-24T14:32:00.000Z"
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Failed to fetch threats",
  "timestamp": "2024-03-24T14:32:00.000Z"
}
```

## API Service Layer Methods

```typescript
dashboardAPI
  ├── getMetrics()
  └── getChartData(timeRange)

threatsAPI
  └── getThreats(filters: { severity, status, page, limit })

riskAPI
  └── getRisks(filters: { minRisk, maxRisk, sortBy, order })

incidentAPI
  ├── getIncidents(filters: { status, severity, page, limit })
  └── createIncident(data)

playbooksAPI
  └── getPlaybooks(filters: { category, search, page, limit })

reportsAPI
  ├── getReports(filters: { type, status, page, limit })
  └── createReport(data)
```

## Database Integration Path

Current (Development):
```
API Routes → Mock Data (lib/mock-data.ts)
```

After Database Integration:
```
API Routes → ORM/Query Builder → PostgreSQL/MongoDB
```

Example with Neon:
```typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const threats = await sql('SELECT * FROM threats WHERE severity = $1', ['critical'])
    return NextResponse.json({ success: true, data: threats })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
```

## Caching Strategy

### Current Implementation
- Dashboard metrics: Refresh every 30 seconds
- Chart data: Refresh every 60 seconds
- Incidents: Refresh every 45 seconds
- Default: No cache (fresh data on each request)

### Recommended for Production
```
User Request
     ↓
Check Cache (Redis)
     ↓
If Found → Return cached data
If Not Found → Query database
     ↓
Store in Cache with TTL
     ↓
Return to user
```

## Error Handling Flow

```
Try to fetch data
     ↓
┌─ Success? ─┐
│            │
Yes          No
│            │
✓ Return    → Catch error
  data         │
              Format error
                │
              Return error
                │
            Component shows
            error message
```

## Authentication & Authorization (Future)

```
Client sends request
        ↓
API Middleware checks JWT token
        ↓
┌─ Valid? ──┐
│           │
Yes         No
│           │
Get user   → Return 401
roles      │ Unauthorized
│
Check endpoint permissions
│
┌─ Allowed? ┐
│           │
Yes         No
│           │
Process   → Return 403
request    │ Forbidden
│
Execute logic
│
Return response
```

## Performance Optimization Points

1. **Request Level**
   - Pagination (limit results)
   - Filtering (reduce data)
   - Compression (gzip)
   - Caching headers

2. **Database Level**
   - Indexes on frequently filtered columns
   - Query optimization
   - Connection pooling
   - Read replicas

3. **Application Level**
   - Redis cache layer
   - Request deduplication
   - Lazy loading
   - Code splitting

4. **Network Level**
   - CDN for static assets
   - API compression
   - HTTP/2
   - Optimal refetch intervals

## Security Architecture

```
Client Request
     ↓
Validate HTTPS
     ↓
Validate CORS origin
     ↓
Check authentication (JWT)
     ↓
Check authorization (roles)
     ↓
Validate input parameters
     ↓
Rate limiting check
     ↓
Execute query with parameterized statements
     ↓
Sanitize output
     ↓
Log request (audit trail)
     ↓
Return response
```

## Deployment Architecture

```
┌─────────────────────────────┐
│   Vercel (Frontend + API)   │
│                             │
│  ┌───────────────────────┐  │
│  │  Next.js App          │  │
│  │  - UI Components      │  │
│  │  - API Routes (/api)  │  │
│  │  - Auth Middleware    │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
           ↓ (Optional)
┌─────────────────────────────┐
│   External Services         │
│                             │
│  - PostgreSQL (Neon)        │
│  - Redis (Upstash)          │
│  - Monitoring (Sentry)      │
└─────────────────────────────┘
```

## Type Safety Flow

```typescript
API Service Layer (type-safe)
        ↓
threatData: Threat[]
risksData: Risk[]
incidents: Incident[]
        ↓
useFetchData Hook (generic <T>)
        ↓
Component Props (typed)
        ↓
JSX Rendering (compile-time checked)
```

All data flows are fully typed with TypeScript!
