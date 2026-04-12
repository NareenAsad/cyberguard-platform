# Backend API Quick Start Guide

## Current Status

✅ **Backend API Layer Complete** - All endpoints implemented with mock data
✅ **Dashboard Page Migrated** - Using real API calls with fallback to mock data
✅ **Documentation Complete** - Full API docs and migration guides available

## Testing the API

### Option 1: Using Mock Data (Current Default)

The API is configured to use mock data by default. No changes needed!

```typescript
// In lib/api-service.ts
const USE_API = true // API routes handle responses
```

When `USE_API = true`, components fetch from `/api/*` endpoints which return mock data.

### Option 2: Switching to Direct Mock Data

If you want to bypass the API during development:

```typescript
// In lib/api-service.ts
const USE_API = false // Components use mock data directly
```

## Testing API Endpoints

You can test any API endpoint directly:

```bash
# Get dashboard metrics
curl http://localhost:3000/api/dashboard/metrics

# Get threats with filters
curl "http://localhost:3000/api/threats?severity=critical&status=blocked"

# Get risk analysis
curl "http://localhost:3000/api/risk-analysis?minRisk=50&maxRisk=100"

# Get incidents
curl "http://localhost:3000/api/incident-response?status=in-progress"

# Get playbooks
curl "http://localhost:3000/api/playbooks?category=Incident%20Response"

# Get reports
curl "http://localhost:3000/api/reports?type=Monthly%20Summary"
```

## Using the API in Components

### Simple Data Fetching

```typescript
import { useFetchData } from '@/hooks/use-fetch-data'
import { threatsAPI } from '@/lib/api-service'

export function MyComponent() {
  const { data: threats, loading, error } = useFetchData(
    () => threatsAPI.getThreats()
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Use threats */}</div>
}
```

### With Filters

```typescript
import { useCallback, useState } from 'react'

export function MyComponent() {
  const [severity, setSeverity] = useState<string | null>(null)
  
  const callback = useCallback(
    () => threatsAPI.getThreats({ severity: severity || undefined }),
    [severity]
  )
  
  const { data: threats } = useFetchData(callback)

  return (
    <>
      <select onChange={(e) => setSeverity(e.target.value || null)}>
        <option value="">All</option>
        <option value="critical">Critical</option>
      </select>
      {/* Render threats */}
    </>
  )
}
```

### With Auto-Refresh

```typescript
const { data: metrics } = useFetchData(
  () => dashboardAPI.getMetrics(),
  { refetchInterval: 30000 } // Refetch every 30 seconds
)
```

## Dashboard Example

The dashboard page has already been updated to use the API:

```typescript
'use client'

import { useCallback } from 'react'
import { dashboardAPI, incidentAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'

export default function DashboardPage() {
  const metricsCallback = useCallback(() => dashboardAPI.getMetrics(), [])
  const incidentsCallback = useCallback(() => incidentAPI.getIncidents({ limit: 3 }), [])

  const { data: metrics, loading: metricsLoading } = useFetchData(metricsCallback)
  const { data: incidents } = useFetchData(incidentsCallback)

  return (
    <div>
      {/* Render with metrics and incidents data */}
    </div>
  )
}
```

## Migrating Other Pages

### Step 1: Update Imports

```typescript
// Before
import { threatData } from '@/lib/mock-data'

// After
import { threatsAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'
```

### Step 2: Add Fetch Hook

```typescript
const { data: threats, loading, error } = useFetchData(
  () => threatsAPI.getThreats()
)
```

### Step 3: Add Loading States

```typescript
{loading ? (
  <Skeleton className="h-20" />
) : threats ? (
  threats.map(t => <div key={t.id}>{t.type}</div>)
) : (
  <p>No data</p>
)}
```

### Step 4: Handle Errors

```typescript
if (error) {
  return <div className="text-red-500">Error: {error.message}</div>
}
```

See **MIGRATION_GUIDE.md** for detailed instructions.

## API Service Methods

### Dashboard

```typescript
import { dashboardAPI } from '@/lib/api-service'

// Get metrics
const { data } = await dashboardAPI.getMetrics()

// Get chart data
const { data } = await dashboardAPI.getChartData('6m')
```

### Threats

```typescript
import { threatsAPI } from '@/lib/api-service'

const { data, total, page, pages } = await threatsAPI.getThreats({
  severity: 'critical',
  status: 'blocked',
  page: 1,
  limit: 10
})
```

### Risk Analysis

```typescript
import { riskAPI } from '@/lib/api-service'

const { data } = await riskAPI.getRisks({
  minRisk: 50,
  maxRisk: 100,
  sortBy: 'riskLevel',
  order: 'desc'
})
```

### Incidents

```typescript
import { incidentAPI } from '@/lib/api-service'

// Get incidents
const { data } = await incidentAPI.getIncidents({
  status: 'in-progress',
  severity: 'critical'
})

// Create incident
const { data: newIncident } = await incidentAPI.createIncident({
  title: 'New Incident',
  severity: 'high',
  description: 'Description'
})
```

### Playbooks

```typescript
import { playbooksAPI } from '@/lib/api-service'

const { data } = await playbooksAPI.getPlaybooks({
  category: 'Incident Response',
  search: 'ransomware'
})
```

### Reports

```typescript
import { reportsAPI } from '@/lib/api-service'

// Get reports
const { data } = await reportsAPI.getReports({
  type: 'Monthly Summary',
  status: 'completed'
})

// Create report
const { data: newReport } = await reportsAPI.createReport({
  title: 'Custom Report',
  type: 'Custom'
})
```

## Files Overview

### API Routes
- `/src/app/api/dashboard/metrics/route.ts` - Metrics endpoint
- `/src/app/api/dashboard/chart-data/route.ts` - Chart data endpoint
- `/src/app/api/threats/route.ts` - Threats endpoint
- `/src/app/api/risk-analysis/route.ts` - Risk analysis endpoint
- `/src/app/api/incident-response/route.ts` - Incidents endpoint
- `/src/app/api/playbooks/route.ts` - Playbooks endpoint
- `/src/app/api/reports/route.ts` - Reports endpoint

### Client Code
- `/src/lib/api-service.ts` - Centralized API service
- `/src/hooks/use-fetch-data.ts` - Data fetching hook
- `/src/lib/mock-data.ts` - Mock data

### Documentation
- `/docs/API_DOCUMENTATION.md` - Complete API reference
- `/docs/MIGRATION_GUIDE.md` - How to migrate pages
- `/docs/BACKEND_IMPLEMENTATION.md` - Architecture overview
- `/docs/QUICKSTART.md` - This file

## Next: Integrating a Real Database

When ready to add a real database:

1. **Set up your database** (PostgreSQL, MongoDB, etc.)
2. **Install an ORM** (Prisma, Drizzle, etc.)
3. **Update API routes** to query your database instead of mock data
4. **Add validation** for input parameters
5. **Add authentication** and authorization
6. **Test thoroughly** before deploying

Example using Neon (PostgreSQL):

```typescript
// In your API route
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const threats = await sql('SELECT * FROM threats LIMIT 10')
    return NextResponse.json({ success: true, data: threats })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
```

See **BACKEND_IMPLEMENTATION.md** for database integration strategies.

## Troubleshooting

### API Returns 500 Error

Check the server logs and make sure:
- All required dependencies are installed
- Environment variables are set correctly
- The database connection string is valid (if using a real database)

### Data Not Updating

Make sure to:
- Include filter variables in the useCallback dependency array
- Set the correct refetchInterval
- Check browser console for fetch errors

### Loading State Never Ends

Verify:
- The fetch function returns a valid response with `success` field
- No infinite loops in effect dependencies
- The API endpoint is responding

## Tips & Best Practices

1. **Always use useCallback** for fetch functions to prevent unnecessary refetches
2. **Use refetchInterval** for real-time data (metrics, incidents)
3. **Handle errors gracefully** - show user-friendly messages
4. **Add loading skeletons** - better UX than spinners
5. **Validate data** - don't assume API returns what you expect
6. **Use TypeScript** - catch bugs before runtime
7. **Test API endpoints** - use curl or Postman
8. **Monitor performance** - use browser DevTools Network tab

## Support

For more information, see:
- `/API_DOCUMENTATION.md` - Complete API reference
- `/MIGRATION_GUIDE.md` - Step-by-step migration guide
- `/BACKEND_IMPLEMENTATION.md` - Architecture and design decisions
