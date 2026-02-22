# CyberGuard Express Backend Setup Guide

This guide covers setting up the separate Express.js backend service that powers CyberGuard's API.

## Architecture Overview

The Express backend handles:
- JWT authentication and token management
- User and organization management
- CVE data aggregation from NVD and OTX APIs
- Asset inventory management
- Risk score calculation coordination
- Incident and playbook management
- Alert generation and management
- PostgreSQL database operations
- MongoDB logging and incident storage

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 13+ database
- MongoDB 4.4+ database
- Environment variables configured

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Database connections (PostgreSQL + MongoDB)
│   │   ├── environment.ts      # Environment variable validation
│   │   └── constants.ts        # Application constants
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification middleware
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── validation.ts       # Request validation
│   │   └── cors.ts             # CORS configuration
│   ├── controllers/
│   │   ├── authController.ts   # Authentication endpoints
│   │   ├── userController.ts   # User management
│   │   ├── cveController.ts    # CVE operations
│   │   ├── assetController.ts  # Asset management
│   │   ├── incidentController.ts # Incident handling
│   │   ├── playbookController.ts # Playbook generation
│   │   ├── riskScoreController.ts # Risk scoring
│   │   └── alertController.ts  # Alert management
│   ├── routes/
│   │   ├── auth.ts             # /api/auth routes
│   │   ├── users.ts            # /api/users routes
│   │   ├── cves.ts             # /api/cves routes
│   │   ├── assets.ts           # /api/assets routes
│   │   ├── incidents.ts        # /api/incidents routes
│   │   ├── playbooks.ts        # /api/playbooks routes
│   │   ├── riskScores.ts       # /api/risk-scores routes
│   │   ├── alerts.ts           # /api/alerts routes
│   │   └── dashboard.ts        # /api/dashboard routes
│   ├── services/
│   │   ├── authService.ts      # Authentication logic
│   │   ├── userService.ts      # User operations
│   │   ├── cveService.ts       # CVE fetching and storage
│   │   ├── assetService.ts     # Asset operations
│   │   ├── incidentService.ts  # Incident management
│   │   ├── playbookService.ts  # Playbook coordination
│   │   ├── riskScoreService.ts # Risk score calculations
│   │   ├── alertService.ts     # Alert operations
│   │   └── integrationService.ts # External API integrations
│   ├── models/
│   │   ├── postgres/           # PostgreSQL models
│   │   │   ├── User.ts
│   │   │   ├── Organization.ts
│   │   │   ├── CVE.ts
│   │   │   ├── Asset.ts
│   │   │   ├── RiskScore.ts
│   │   │   ├── Incident.ts
│   │   │   └── Alert.ts
│   │   └── mongodb/            # MongoDB models
│   │       ├── IncidentLog.ts
│   │       ├── PlaybookLog.ts
│   │       ├── SystemLog.ts
│   │       └── ThreatLog.ts
│   ├── utils/
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── crypto.ts           # Encryption/hashing
│   │   ├── validators.ts       # Input validation helpers
│   │   ├── errors.ts           # Custom error classes
│   │   ├── logger.ts           # Logging utilities
│   │   └── helpers.ts          # General helpers
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── app.ts                  # Express app setup
├── .env.example                # Example environment variables
├── .env                        # Actual environment variables (gitignored)
├── package.json
├── tsconfig.json
├── Dockerfile                  # Docker configuration
└── docker-compose.yml          # Docker Compose setup

```

## Installation

### 1. Clone and Install Dependencies

```bash
# Create backend directory
mkdir cyberguard-backend
cd cyberguard-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv axios bcrypt jsonwebtoken pg mongodb
npm install -D typescript @types/express @types/node ts-node nodemon
```

### 2. Environment Configuration

Create a `.env` file in the backend root:

```env
# Server
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001/api

# Database - PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=cyberguard
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=cyberguard_db

# Database - MongoDB
MONGODB_URI=mongodb://localhost:27017/cyberguard_logs

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
JWT_REFRESH_SECRET=your-refresh-token-secret

# External APIs
NVD_API_KEY=your_nvd_api_key
NVD_API_URL=https://services.nvd.nist.gov/rest/json

OTX_API_KEY=your_otx_api_key
OTX_API_URL=https://otx.alienvault.com/api/v1

# FastAPI Microservice
FASTAPI_URL=http://localhost:8000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Feature Flags
ENABLE_CVE_SYNC=true
CVE_SYNC_INTERVAL=3600000 # 1 hour in milliseconds
```

### 3. Database Setup

#### PostgreSQL Setup

```bash
# Create database
createdb cyberguard_db

# Create user
psql -U postgres -d cyberguard_db -c "CREATE USER cyberguard WITH PASSWORD 'secure_password_here';"

# Grant privileges
psql -U postgres -d cyberguard_db -c "GRANT ALL PRIVILEGES ON DATABASE cyberguard_db TO cyberguard;"

# Load schema
psql -U cyberguard -d cyberguard_db -f ../scripts/postgres-schema.sql
```

#### MongoDB Setup

```bash
# MongoDB automatically creates databases on first use
# Ensure MongoDB is running on localhost:27017
```

## Key Implementation Components

### 1. Authentication Service

**Features:**
- JWT token generation with expiry
- Refresh token rotation
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on login attempts
- API key generation and management

```typescript
// Example auth flow
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Acme Corp"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": { ... }
  }
}
```

### 2. CVE Aggregation Service

**Responsibilities:**
- Fetch CVEs from NVD and OTX APIs
- Normalize CVE data to standard format
- Store in PostgreSQL with indexing
- Schedule periodic updates
- Handle API rate limiting

```typescript
// CVE fetch and sync
POST /api/cves/sync
Response: { synced: 150, updated: 45, errors: 0 }

// Search CVEs
GET /api/cves/search?q=Apache&page=1&limit=20
```

### 3. Asset Management

**Features:**
- Upload asset inventory (CSV/JSON)
- CPE parsing and validation
- Vulnerability count tracking
- Risk score association
- Asset criticality levels

```typescript
POST /api/assets/upload
FormData: { file: File, organizationId: string }

Response:
{
  "imported": 250,
  "matched": 189,
  "vulnerabilities": 523
}
```

### 4. Risk Scoring Engine

**Coordinates with FastAPI for:**
- Contextual risk calculation
- Asset criticality weighting
- Exploit availability assessment
- Industry/threat landscape factors

```typescript
POST /api/risk-scores/calculate
{
  "organizationId": "org-uuid",
  "assetIds": ["asset-1", "asset-2"]
}

Response:
[
  {
    "assetId": "asset-1",
    "contextualScore": 85.3,
    "factors": { ... }
  }
]
```

### 5. Incident Response Coordination

**Integration with FastAPI:**
- Request playbook generation
- Store playbooks in MongoDB
- Track incident timeline
- Update incident status

```typescript
POST /api/incidents/{incidentId}/generate-playbook
{
  "cveId": "CVE-2024-XXXXX",
  "assetId": "asset-uuid"
}

Response:
{
  "playbookId": "playbook-uuid",
  "steps": [ ... ],
  "estimatedTime": 120,
  "automationPossible": true
}
```

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/validate` - Validate token

### Users & Organizations
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/api-keys` - List API keys
- `POST /api/users/api-keys` - Create API key
- `DELETE /api/users/api-keys/{keyId}` - Delete API key

### CVEs
- `GET /api/cves?page=1&limit=20` - List CVEs
- `GET /api/cves/{cveId}` - Get CVE details
- `GET /api/cves/search?q=query` - Search CVEs
- `POST /api/cves/sync` - Sync CVEs from NVD/OTX
- `POST /api/cves/match-assets` - Match CVEs to assets

### Assets
- `GET /api/assets?page=1&limit=20` - List assets
- `GET /api/assets/{assetId}` - Get asset details
- `POST /api/assets` - Create asset
- `PUT /api/assets/{assetId}` - Update asset
- `DELETE /api/assets/{assetId}` - Delete asset
- `POST /api/assets/upload` - Bulk upload assets

### Incidents
- `GET /api/incidents?page=1&limit=20` - List incidents
- `GET /api/incidents/{incidentId}` - Get incident
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/{incidentId}` - Update incident
- `POST /api/incidents/{incidentId}/timeline` - Add timeline event

### Playbooks
- `GET /api/playbooks/{playbookId}` - Get playbook
- `POST /api/playbooks/generate` - Generate playbook (calls FastAPI)
- `GET /api/playbooks?page=1&limit=20` - List playbooks

### Risk Scores
- `GET /api/risk-scores?organizationId=org-id` - List risk scores
- `GET /api/risk-scores/{assetId}` - Get asset risk score
- `POST /api/risk-scores/calculate` - Calculate scores

### Alerts
- `GET /api/alerts?page=1&limit=20` - List alerts
- `GET /api/alerts/{alertId}` - Get alert
- `PATCH /api/alerts/{alertId}/acknowledge` - Acknowledge alert

### Dashboard
- `GET /api/dashboard/stats?organizationId=org-id` - Dashboard statistics
- `GET /api/dashboard/threat-activity?organizationId=org-id&days=7` - Threat activity data

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Validation error
- `401` - Authentication required
- `403` - Insufficient permissions
- `404` - Resource not found
- `429` - Rate limited
- `500` - Server error

## Security Best Practices

1. **Password Hashing:** All passwords hashed with bcrypt (12 rounds)
2. **JWT Tokens:** Short expiry (15 minutes) with refresh tokens (7 days)
3. **API Keys:** Hashed before storage, never returned after creation
4. **CORS:** Configured to allow only frontend URL
5. **Rate Limiting:** Implemented on auth endpoints
6. **Input Validation:** All requests validated before processing
7. **SQL Injection Prevention:** Using parameterized queries
8. **HTTPS:** Enforced in production

## Running the Backend

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Production start
npm start

# Testing
npm test

# Linting
npm run lint
```

## Integration with FastAPI Microservice

The Express backend communicates with the FastAPI service for:

1. **Risk Scoring:** POST to `/risk-score/calculate`
2. **Playbook Generation:** POST to `/playbook/generate`
3. **CVE Enrichment:** POST to `/cve/enrich`
4. **Threat Detection:** POST to `/threat/predict`

Example integration:

```typescript
async function generatePlaybook(cveId: string, assetId: string) {
  const fastApiUrl = process.env.FASTAPI_URL;
  const response = await axios.post(
    `${fastApiUrl}/playbook/generate`,
    {
      cveId,
      assetId,
      organizationContext: { ... }
    },
    { timeout: 30000 }
  );
  
  return response.data;
}
```

## Database Migrations

Use migration tools like Flyway or Knex.js for PostgreSQL schema versioning:

```bash
npm install knex

# Create migration
npx knex migrate:make create_users_table

# Run migrations
npx knex migrate:latest

# Rollback
npx knex migrate:rollback
```

## Monitoring and Logging

- Log all API requests and errors to MongoDB
- Use structured logging with severity levels
- Implement request tracking with correlation IDs
- Set up alerts for error rates > 1%

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t cyberguard-backend .

# Run container
docker run -d \
  --name cyberguard-backend \
  -p 3001:3001 \
  --env-file .env \
  cyberguard-backend

# Or use docker-compose
docker-compose up -d
```

### Environment-Specific Configuration

Update `.env` for production with:
- Secure JWT secrets
- Production database credentials
- External API keys
- Set `NODE_ENV=production`

## Troubleshooting

**Database Connection Issues:**
```bash
# Test PostgreSQL
psql -U cyberguard -d cyberguard_db -c "SELECT 1"

# Test MongoDB
mongosh mongodb://localhost:27017/cyberguard_logs
```

**API Key Issues:**
- Ensure JWT_SECRET is set and consistent
- Check token expiry times
- Verify CORS configuration matches frontend URL

**CVE Sync Failures:**
- Check NVD_API_KEY is valid
- Verify network connectivity to external APIs
- Review logs for rate limiting errors

## Next Steps

1. Implement authentication controllers
2. Set up CVE sync service with scheduled tasks
3. Create asset upload and matching logic
4. Integrate FastAPI for risk scoring
5. Deploy to production environment
