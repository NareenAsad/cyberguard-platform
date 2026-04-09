# CyberGuard API Documentation

## Overview

The CyberGuard API provides backend endpoints for the security operations dashboard. All endpoints return JSON responses and include proper error handling.

## API Service Layer

The frontend uses a centralized API service layer (`lib/api-service.ts`) that provides:
- Automatic fallback to mock data when `USE_API = false`
- Consistent error handling and response formatting
- Type-safe API calls with TypeScript

## Base URL

```
/api
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-03-24T14:32:00Z"
}
```

Paginated responses include:
```json
{
  "success": true,
  "data": [],
  "total": 100,
  "page": 1,
  "pages": 10,
  "limit": 10,
  "timestamp": "2024-03-24T14:32:00Z"
}
```

## Dashboard Endpoints

### GET /api/dashboard/metrics

Fetch dashboard metrics (threats detected, risk score, active incidents, systems monitored).

**Query Parameters:**
- None

**Response:**
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
  }
}
```

### GET /api/dashboard/chart-data

Fetch historical threat data for chart visualization.

**Query Parameters:**
- `timeRange` (string): Time range filter - `1m`, `6m`, `1y`, etc. Default: `6m`

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "Jan", "threats": 400, "detected": 240 },
    { "name": "Feb", "threats": 520, "detected": 320 }
  ],
  "timeRange": "6m"
}
```

## Threats Endpoints

### GET /api/threats

Fetch threat data with optional filtering and pagination.

**Query Parameters:**
- `severity` (string): Filter by severity - `critical`, `high`, `medium`, `low`
- `status` (string): Filter by status - `blocked`, `mitigating`, `quarantined`, `isolated`
- `page` (number): Page number. Default: `1`
- `limit` (number): Results per page. Default: `10`

**Example:**
```
GET /api/threats?severity=critical&status=blocked&page=1&limit=10
```

**Response:**
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
  "limit": 10
}
```

## Risk Analysis Endpoints

### GET /api/risk-analysis

Fetch asset risk analysis with filtering and sorting.

**Query Parameters:**
- `minRisk` (number): Minimum risk level (0-100)
- `maxRisk` (number): Maximum risk level (0-100)
- `sortBy` (string): Sort field - `riskLevel`, `vulnerabilities`
- `order` (string): Sort order - `asc`, `desc`. Default: `desc`

**Example:**
```
GET /api/risk-analysis?minRisk=50&maxRisk=100&sortBy=riskLevel&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "asset": "Production Database",
      "riskLevel": 78,
      "vulnerabilities": 12,
      "exposureTime": "32 days",
      "recommendation": "Apply security patches immediately"
    }
  ],
  "total": 5,
  "filters": {
    "minRisk": 50,
    "maxRisk": 100
  }
}
```

## Incident Response Endpoints

### GET /api/incident-response

Fetch incidents with optional filtering and pagination.

**Query Parameters:**
- `status` (string): Filter by status - `in-progress`, `resolved`
- `severity` (string): Filter by severity - `critical`, `high`, `medium`, `low`
- `page` (number): Page number. Default: `1`
- `limit` (number): Results per page. Default: `10`

**Example:**
```
GET /api/incident-response?status=in-progress&severity=critical
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "INC-2024-001",
      "title": "Unauthorized Database Access",
      "severity": "critical",
      "status": "in-progress",
      "created": "2024-03-24 14:32:00",
      "updated": "2024-03-24 15:20:00",
      "assignee": "John Davis",
      "description": "Multiple failed login attempts..."
    }
  ],
  "total": 8,
  "page": 1,
  "pages": 1,
  "limit": 10
}
```

### POST /api/incident-response

Create a new incident.

**Request Body:**
```json
{
  "title": "New Incident",
  "severity": "high",
  "status": "in-progress",
  "assignee": "Security Team",
  "description": "Incident description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "INC-2024-004",
    "title": "New Incident",
    "severity": "high",
    "status": "in-progress",
    "created": "2024-03-24 16:00:00",
    "updated": "2024-03-24 16:00:00",
    "assignee": "Security Team",
    "description": "Incident description"
  },
  "message": "Incident created successfully"
}
```

## Playbooks Endpoints

### GET /api/playbooks

Fetch playbooks with optional filtering.

**Query Parameters:**
- `category` (string): Filter by category
- `search` (string): Search in title and description
- `page` (number): Page number. Default: `1`
- `limit` (number): Results per page. Default: `10`

**Example:**
```
GET /api/playbooks?category=Incident%20Response&page=1
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PB-001",
      "title": "Ransomware Response",
      "category": "Incident Response",
      "steps": 8,
      "updatedBy": "Security Team",
      "lastUpdated": "2024-03-20",
      "description": "Step-by-step guide for responding to ransomware incidents"
    }
  ],
  "total": 4,
  "page": 1,
  "pages": 1,
  "limit": 10
}
```

## Reports Endpoints

### GET /api/reports

Fetch reports with optional filtering.

**Query Parameters:**
- `type` (string): Filter by report type - `Monthly Summary`, `Assessment`, `Compliance`
- `status` (string): Filter by status - `generating`, `completed`, `failed`
- `page` (number): Page number. Default: `1`
- `limit` (number): Results per page. Default: `10`

**Example:**
```
GET /api/reports?type=Monthly%20Summary&status=completed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "REP-001",
      "title": "Monthly Security Report - March 2024",
      "type": "Monthly Summary",
      "generated": "2024-03-24",
      "status": "completed",
      "threats": 2847,
      "resolved": 2189,
      "download": "report-march-2024.pdf"
    }
  ],
  "total": 3,
  "page": 1,
  "pages": 1,
  "limit": 10
}
```

### POST /api/reports

Create a new report.

**Request Body:**
```json
{
  "title": "Custom Security Report",
  "type": "Custom",
  "filters": {
    "dateRange": "2024-03-01 to 2024-03-31"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "REP-004",
    "title": "Custom Security Report",
    "type": "Custom",
    "status": "generating",
    "generated": "2024-03-24"
  },
  "message": "Report generation started"
}
```

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Server Error

## Using the API Service Layer

The frontend uses a centralized service layer for all API calls:

```typescript
import { dashboardAPI, threatsAPI, riskAPI, incidentAPI, playbooksAPI, reportsAPI } from '@/lib/api-service'

// Example: Fetch metrics
const response = await dashboardAPI.getMetrics()
if (response.success) {
  console.log(response.data)
}

// Example: Fetch threats with filters
const threatsResponse = await threatsAPI.getThreats({
  severity: 'critical',
  status: 'blocked',
  page: 1,
  limit: 10
})
```

## Using the Fetch Hook

For reactive data fetching in components:

```typescript
import { useFetchData } from '@/hooks/use-fetch-data'
import { threatsAPI } from '@/lib/api-service'

export function MyComponent() {
  const { data, loading, error } = useFetchData(
    () => threatsAPI.getThreats({ severity: 'critical' }),
    { refetchInterval: 30000 } // Refetch every 30 seconds
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{/* Use data */}</div>
}
```

## Switching Between Mock Data and Real API

To switch between mock data and actual API calls, change the `USE_API` flag in `lib/api-service.ts`:

```typescript
const USE_API = true  // Use API endpoints
const USE_API = false // Use mock data (for development/testing)
```

## Future Database Integration

All endpoints currently use mock data but are structured to accept database queries. Replace the mock data lines with actual database operations:

```typescript
// Instead of:
return nextResponse.json({ success: true, data: threatData })

// You would use:
const threats = await db.query('SELECT * FROM threats WHERE ...')
return nextResponse.json({ success: true, data: threats })
```
