# Migration Guide: From Mock Data to API

This guide shows how to migrate pages from using mock data to using the API service layer.

## Overview

The CyberGuard dashboard was built with mock data for rapid development. Now that the API layer is in place, you can migrate each page to fetch real data from the backend.

## Key Concepts

1. **API Service Layer** (`lib/api-service.ts`) - Centralized API calls with fallback to mock data
2. **Fetch Hook** (`hooks/use-fetch-data.ts`) - React hook for data fetching with loading/error states
3. **Mock Data Fallback** - `USE_API` flag in `api-service.ts` enables/disables API usage

## Step-by-Step Migration

### 1. Update Component Imports

Replace mock data imports with API service imports:

```typescript
// Before
import { threatData } from '@/lib/mock-data'

// After
import { threatsAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'
```

### 2. Convert to Client Component

Ensure your component is a client component:

```typescript
'use client'
```

### 3. Add Fetch Hook

Convert useState-based data to useFetchData hook:

```typescript
// Before
const [threats, setThreats] = useState(threatData)

// After
const threatsCallback = useCallback(
  () => threatsAPI.getThreats({ severity: selectedSeverity, status: selectedStatus }),
  [selectedSeverity, selectedStatus]
)
const { data: threats, loading: threatsLoading, error: threatsError } = useFetchData(threatsCallback)
```

### 4. Add Loading States

Add loading skeletons while data is being fetched:

```typescript
import { Skeleton } from '@/components/skeleton'

// In your JSX
{threatsLoading ? (
  <>
    <Skeleton className="h-16" />
    <Skeleton className="h-16" />
    <Skeleton className="h-16" />
  </>
) : threats ? (
  // Render threats
) : (
  <p>No threats found</p>
)}
```

### 5. Handle Errors

Add error handling:

```typescript
if (threatsError) {
  return <div className="text-destructive">Error: {threatsError.message}</div>
}
```

## Example: Threats Page Migration

### Before (Mock Data)

```typescript
'use client'

import { useState } from 'react'
import { threatData } from '@/lib/mock-data'

export default function ThreatsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  
  const filteredThreats = threatData.filter(threat => {
    return !selectedSeverity || threat.severity === selectedSeverity
  })

  return (
    <div>
      <select onChange={(e) => setSelectedSeverity(e.target.value || null)}>
        <option value="">All Severities</option>
        <option value="critical">Critical</option>
      </select>
      
      {filteredThreats.map(threat => (
        <div key={threat.id}>{threat.type}</div>
      ))}
    </div>
  )
}
```

### After (API Integration)

```typescript
'use client'

import { useCallback, useState } from 'react'
import { threatsAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'
import { Skeleton } from '@/components/skeleton'

export default function ThreatsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  
  const threatsCallback = useCallback(
    () => threatsAPI.getThreats({ severity: selectedSeverity || undefined }),
    [selectedSeverity]
  )
  
  const { data: threats, loading, error } = useFetchData(threatsCallback)

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>
  }

  return (
    <div>
      <select onChange={(e) => setSelectedSeverity(e.target.value || null)}>
        <option value="">All Severities</option>
        <option value="critical">Critical</option>
      </select>
      
      {loading ? (
        <>
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </>
      ) : threats && threats.length > 0 ? (
        threats.map(threat => (
          <div key={threat.id}>{threat.type}</div>
        ))
      ) : (
        <p>No threats found</p>
      )}
    </div>
  )
}
```

## Pagination Handling

For paginated endpoints:

```typescript
const [page, setPage] = useState(1)

const threatsCallback = useCallback(
  () => threatsAPI.getThreats({ 
    page, 
    limit: 10,
    severity: selectedSeverity || undefined 
  }),
  [page, selectedSeverity]
)

const { data: threats, loading } = useFetchData(threatsCallback)

// Extract pagination info from response
const total = threats?.total || 0
const pages = threats?.pages || 1
```

## Auto-Refetch Implementation

For real-time updates, use the `refetchInterval` option:

```typescript
const { data: metrics, loading } = useFetchData(
  () => dashboardAPI.getMetrics(),
  {
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Can be toggled based on conditions
  }
)
```

## POST Requests (Creating Data)

For mutation operations:

```typescript
const handleCreateIncident = async (incident: any) => {
  try {
    const response = await incidentAPI.createIncident(incident)
    if (response.success) {
      // Refresh the incidents list
      threatsCallback()
      showSuccessMessage('Incident created')
    }
  } catch (error) {
    showErrorMessage(error.message)
  }
}
```

## Migration Checklist

- [ ] Import API service instead of mock data
- [ ] Convert component to 'use client'
- [ ] Replace useState with useFetchData hook
- [ ] Add loading skeletons
- [ ] Add error handling
- [ ] Test with actual API calls
- [ ] Verify pagination (if applicable)
- [ ] Test filters and search
- [ ] Add refetch intervals for real-time updates

## Pages Ready for Migration

1. `/app/threats/page.tsx` - Migrate to threatsAPI
2. `/app/risk-analysis/page.tsx` - Migrate to riskAPI
3. `/app/incident-response/page.tsx` - Migrate to incidentAPI
4. `/app/playbooks/page.tsx` - Migrate to playbooksAPI
5. `/app/reports/page.tsx` - Migrate to reportsAPI

## Switching Between Mock and Real Data

To test with mock data while implementing the backend:

```typescript
// In lib/api-service.ts
const USE_API = false // Set to false to use mock data fallback
```

This allows you to develop and test UI logic with mock data, then switch to real API calls when ready.

## Common Issues

### Issue: Data Not Updating After Filter Change

**Solution:** Make sure the filter variable is in the useCallback dependency array:

```typescript
const threatsCallback = useCallback(
  () => threatsAPI.getThreats({ severity: selectedSeverity }),
  [selectedSeverity] // Include all filter variables
)
```

### Issue: Infinite Refetch Loop

**Solution:** Verify the callback function isn't being recreated on every render:

```typescript
// Use useCallback to memoize the callback
const callback = useCallback(() => api.getData(), [dependencies])
```

### Issue: State Not Syncing With API

**Solution:** Use the hook pattern correctly:

```typescript
// Correct
const { data } = useFetchData(() => api.get(), [])

// Wrong - callback changes on every render
const { data } = useFetchData(() => api.get())
```

## Next Steps

1. Verify API endpoints are working with your backend
2. Migrate remaining pages one by one
3. Add WebSocket integration for real-time updates
4. Implement proper error boundaries
5. Add request caching and optimization
