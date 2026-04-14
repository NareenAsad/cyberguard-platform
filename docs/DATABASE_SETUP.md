# CyberGuard Database Setup Guide

## Overview

This guide walks you through setting up the Neon PostgreSQL database for CyberGuard. The application uses `@neondatabase/serverless` for direct SQL queries with built-in fallback to mock data for graceful degradation.

## Prerequisites

- Neon account and database connection string
- Environment variables properly configured in Vercel project settings
- Node.js 18+ (for running setup scripts)

## Setup Steps

### 1. Database Connection

The application reads the database URL from the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]
```

This is automatically provided by the Neon integration in Vercel.

### 2. Install Dependencies

The required packages are already listed in `package.json`:

```bash
npm install
# or
pnpm install
```

Key packages:
- `@neondatabase/serverless` - Serverless PostgreSQL client
- `prisma` - Database schema management (optional, for migrations)

### 3. Initialize Database Schema

Run the initialization script to create all tables:

```bash
npm run db:init
```

This creates the following tables:
- **Threat** - Security threats and detections
- **RiskAnalysis** - Asset risk assessments
- **Incident** - Incidents and responses
- **Playbook** - Response playbooks and procedures
- **Report** - Generated reports and analysis
- **DashboardMetric** - Dashboard statistics and metrics

### 4. Seed Initial Data (Optional)

Populate the database with mock data:

```bash
npm run db:seed
```

Or run both initialization and seeding:

```bash
npm run db:setup
```

## Database Schema

### Threat Table

```sql
CREATE TABLE "Threat" (
  id TEXT PRIMARY KEY,
  threatId TEXT UNIQUE,
  type TEXT,
  severity TEXT,
  source TEXT,
  target TEXT,
  detected TEXT,
  status TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

**Fields:**
- `threatId`: Unique threat identifier
- `severity`: critical, high, medium, low
- `status`: blocked, mitigating, quarantined, isolated
- `detected`: Timestamp of detection

### RiskAnalysis Table

```sql
CREATE TABLE "RiskAnalysis" (
  id TEXT PRIMARY KEY,
  asset TEXT UNIQUE,
  riskLevel INTEGER,
  vulnerabilities INTEGER,
  exposureTime TEXT,
  recommendation TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Incident Table

```sql
CREATE TABLE "Incident" (
  id TEXT PRIMARY KEY,
  incidentId TEXT UNIQUE,
  title TEXT,
  description TEXT,
  severity TEXT,
  status TEXT,
  assignee TEXT,
  created TEXT,
  updated TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Playbook Table

```sql
CREATE TABLE "Playbook" (
  id TEXT PRIMARY KEY,
  playbookId TEXT UNIQUE,
  title TEXT,
  description TEXT,
  category TEXT,
  steps INTEGER,
  updatedBy TEXT,
  lastUpdated TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### Report Table

```sql
CREATE TABLE "Report" (
  id TEXT PRIMARY KEY,
  reportId TEXT UNIQUE,
  title TEXT,
  type TEXT,
  status TEXT,
  generated TEXT,
  threats INTEGER,
  resolved INTEGER,
  download TEXT,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### DashboardMetric Table

```sql
CREATE TABLE "DashboardMetric" (
  id TEXT PRIMARY KEY,
  threatsDetected INTEGER,
  threatsDetectedChange INTEGER,
  riskScore INTEGER,
  riskScoreChange INTEGER,
  incidentsActive INTEGER,
  incidentsActiveChange INTEGER,
  systemsMonitored INTEGER,
  systemsMonitoredChange INTEGER,
  updatedAt TIMESTAMP
)
```

## API Endpoints with Database Integration

All API endpoints in `/app/api/` have been updated to:

1. **Try database first** - Attempts to fetch from Neon PostgreSQL
2. **Fallback to mock data** - Uses mock data if database is unavailable
3. **Return warnings** - Includes `_warning` flag when using mock data

### Available Endpoints

| Endpoint | Method | Database Query |
|----------|--------|-----------------|
| `/api/dashboard/metrics` | GET | `getDashboardMetrics()` |
| `/api/dashboard/chart-data` | GET | `getThreats()` |
| `/api/threats` | GET | `getThreats(filters)` |
| `/api/risk-analysis` | GET | `getRisks(filters)` |
| `/api/incident-response` | GET, POST | `getIncidents()`, `createIncident()` |
| `/api/playbooks` | GET | `getPlaybooks(filters)` |
| `/api/reports` | GET, POST | `getReports(filters)` |

## Database Utility Functions

Located in `/lib/db.ts`, these functions handle all database operations:

```typescript
// Query functions
getThreats(filters)        // Get threats with optional filtering
getRisks(filters)          // Get risk analysis data
getIncidents(filters)      // Get incidents
getPlaybooks(filters)      // Get playbooks
getReports(filters)        // Get reports
getDashboardMetrics()      // Get dashboard statistics

// Write functions
createIncident(incident)   // Create a new incident
```

### Example Usage

```typescript
import { getThreats, createIncident } from '@/lib/db'

// Fetch threats filtered by severity
const result = await getThreats({ 
  severity: 'critical',
  page: 1,
  limit: 10 
})

if (result.success) {
  console.log(result.data)
}

// Create a new incident
const incident = await createIncident({
  title: 'Security Breach',
  description: 'Unauthorized access detected',
  severity: 'critical',
  assignee: 'Security Team'
})
```

## Migration and Updates

### Adding New Tables

1. Update `/prisma/schema.prisma` with new model
2. Create a migration script in `/scripts/` to create the table
3. Run: `npm run db:init` (or create specific migration)

### Modifying Existing Tables

1. Create a new migration script in `/scripts/`
2. Add ALTER TABLE statements
3. Run the migration script

### Troubleshooting

**Connection Issues:**
- Verify `DATABASE_URL` environment variable is set
- Check Neon dashboard for active database
- Ensure IP whitelist includes your deployment region

**Schema Errors:**
- Check that tables were created: `npm run db:init`
- Verify all required columns exist
- Check data types match the schema

**Performance:**
- Add indexes for frequently queried columns (already done)
- Consider connection pooling with Neon's built-in features
- Monitor query performance in Neon dashboard

## Graceful Degradation

The application includes automatic fallback to mock data when the database is unavailable:

```
Database Available → Use Real Data
         ↓ (Error)
Database Unavailable → Use Mock Data
         ↓
Show Warning in Response
```

This ensures the application continues functioning even if the database is temporarily unavailable.

## Best Practices

1. **Always use parameterized queries** - Prevent SQL injection
   ```typescript
   sql`SELECT * FROM "Threat" WHERE severity = ${severity}`
   ```

2. **Check success before using data** - All database functions return `{ success, data, error }`
   ```typescript
   if (result.success && result.data) {
     // Use result.data
   }
   ```

3. **Log errors for debugging** - Console.error is already configured
   ```typescript
   console.error('Database error:', error)
   ```

4. **Add rate limiting** - Consider for API endpoints with write operations

5. **Validate input** - All POST endpoints should validate request body

## Next Steps

1. Set the `DATABASE_URL` environment variable in Vercel project settings
2. Run `npm run db:setup` to initialize and seed the database
3. Test endpoints to verify database connectivity
4. Monitor database usage in Neon console

For more information, visit:
- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://neon.tech/docs/guides/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
