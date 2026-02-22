# CyberGuard Full-Stack Architecture Guide

## System Overview

CyberGuard is a production-grade AI-driven cybersecurity platform built with a modern microservices architecture. It aggregates CVE data, analyzes organizational assets, calculates contextual risk scores, and generates AI-based incident response playbooks.

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** SWR for client-side data fetching
- **UI Components:** Shadcn/ui
- **Charts:** Recharts
- **Authentication:** JWT tokens with secure storage

### Backend Services
- **API Server:** Express.js (Node.js)
- **Language:** TypeScript
- **AI Microservice:** FastAPI (Python)
- **Message Queue:** Celery (optional, for async tasks)
- **Caching:** Redis

### Databases
- **Structured Data:** PostgreSQL 13+
  - Users, organizations, assets
  - CVEs, risk scores, incidents
  - Alerts, playbooks
- **Unstructured Logs:** MongoDB 4.4+
  - Incident logs and audit trails
  - Threat intelligence logs
  - System logs

### External Integrations
- **CVE Data:** NVD API, OTX API
- **LLM:** OpenAI (for playbook generation)
- **AI Models:** scikit-learn, PyTorch

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Dashboard, Auth, Asset Management)        │
│  - Real-time charts and alerts                              │
│  - Authentication with JWT                                  │
│  - Role-based access control                                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ (JWT Bearer Token)
┌─────────────────┴───────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Express.js Backend (Port 3001)                             │
│  - Authentication & Authorization                          │
│  - Request validation & error handling                      │
│  - Rate limiting & logging                                  │
└────┬──────────────┬─────────────────────────┬───────────────┘
     │              │                         │
     │              │                         │
┌────┴────┐    ┌────┴────┐            ┌─────┴──────┐
│  CVE    │    │ Asset   │            │ Incident   │
│ Manager │    │ Manager │            │  Manager   │
└────┬────┘    └────┬────┘            └─────┬──────┘
     │              │                       │
     └──────────┬───┴───────────────────────┘
                │
        ┌───────┴──────────┐
        │  FastAPI Service │  (Port 8000)
        │  AI Microservice │
        ├──────────────────┤
        │ • Risk Scoring   │
        │ • CVE Enrichment │
        │ • Threat ML      │
        │ • Playbooks      │
        └────┬─────────────┘
             │
    ┌────────┴───────────┐
    │  External APIs     │
    ├────────────────────┤
    │ • NVD API          │
    │ • OTX API          │
    │ • OpenAI (LLM)     │
    └────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL               │  MongoDB         │  Redis       │
│  (Structured Data)        │  (Logs)          │  (Cache)     │
│  ├─ Users                 │  ├─ Audit logs   │              │
│  ├─ Organizations         │  ├─ Threat logs  │              │
│  ├─ Assets                │  └─ System logs  │              │
│  ├─ CVEs                  │                  │              │
│  ├─ Risk Scores           │                  │              │
│  ├─ Incidents             │                  │              │
│  └─ Alerts                │                  │              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User Login
    ↓
[Next.js Frontend]
    ↓ POST /api/auth/login
[Express Backend] - Validate credentials
    ↓
[PostgreSQL] - Query user
    ↓
[Express Backend] - Generate JWT token
    ↓
[Next.js Frontend] - Store token in memory
    ↓
Include in subsequent requests as Bearer token
```

### 2. CVE Processing Flow

```
[Express Backend Scheduled Job]
    ↓
Fetch from NVD/OTX APIs
    ↓
[FastAPI] CVE Enrichment Service
    ↓ Normalize data
    ↓
[PostgreSQL] Store CVE records
    ↓
[Redis] Cache enriched data (24h TTL)
    ↓
[Express Backend] Match CVEs to organizational assets
    ↓
[PostgreSQL] Update asset vulnerability counts
```

### 3. Risk Scoring Flow

```
[Express Backend] Receives asset query
    ↓
Check [Redis] for cached risk scores
    ↓ Cache miss
    ↓
POST to [FastAPI] /risk-score/calculate
    ↓
[FastAPI] Analyzes:
    • CVE base score
    • Asset criticality
    • Exploit availability
    • Industry factors
    ↓
Contextual risk score calculated
    ↓
[Redis] Cache result (1h TTL)
    ↓
Response to [Express Backend]
    ↓
Response to [Next.js Frontend]
```

### 4. Incident Response Flow

```
[User] Creates/Detects Incident
    ↓
[Next.js Frontend] POST /api/incidents
    ↓
[Express Backend] Create incident record
    ↓ Store in [PostgreSQL]
    ↓
[User] Requests playbook generation
    ↓
POST to [FastAPI] /playbook/generate
    ↓
[FastAPI] Uses LLM (OpenAI GPT-4)
    • Understands CVE context
    • Knows asset configuration
    • Considers organization size/industry
    ↓ Generates steps
    ↓
[MongoDB] Store playbook
    ↓
[PostgreSQL] Link playbook to incident
    ↓
[Next.js Frontend] Display playbook steps
```

## Authentication & Authorization

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "user-uuid",
    "email": "user@example.com",
    "organizationId": "org-uuid",
    "role": "analyst",
    "iat": 1704067200,
    "exp": 1704068100
  }
}
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **Admin** | Full access - users, org settings, all data operations |
| **Analyst** | Read all, create/edit incidents, generate playbooks |
| **Viewer** | Read-only access to dashboard and reports |

### API Key Authentication

For integrations:
- Generate API keys in user profile
- Keys hashed before storage
- Include in `X-API-Key` header
- Scoped to organization

## Security Measures

### 1. Password Security
- Hashed with bcrypt (12 salt rounds)
- Minimum 8 characters
- Never logged or exposed

### 2. Token Security
- JWT signed with HS256
- Short expiry: 15 minutes (access token)
- Refresh tokens: 7 days
- Tokens stored in memory (not localStorage)

### 3. Data Protection
- PostgreSQL connections over SSL
- API keys hashed before storage
- Sensitive data encrypted at rest
- Row-level security (RLS) for MongoDB

### 4. Network Security
- CORS restricted to frontend domain
- Rate limiting on auth endpoints
- HTTPS enforced in production
- API request logging and monitoring

### 5. Input Validation
- All inputs validated against Pydantic schemas
- SQL injection prevention with parameterized queries
- XSS prevention through React
- CSRF tokens for state-changing operations

## Database Schema

### PostgreSQL Core Tables

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  role VARCHAR, -- admin, analyst, viewer
  organization_id UUID FOREIGN KEY
);

-- Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY,
  organization_id UUID,
  name VARCHAR,
  cpe VARCHAR, -- Common Platform Enumeration
  criticality VARCHAR, -- critical, high, medium, low
  vulnerability_count INT,
  risk_score NUMERIC,
  FOREIGN KEY (organization_id)
);

-- CVEs
CREATE TABLE cves (
  id UUID PRIMARY KEY,
  cve_id VARCHAR UNIQUE, -- CVE-2024-XXXXX
  severity VARCHAR,
  base_score NUMERIC,
  exploitability_score NUMERIC,
  published_date TIMESTAMP,
  source VARCHAR -- nvd, otx, both
);

-- Risk Scores
CREATE TABLE risk_scores (
  id UUID PRIMARY KEY,
  asset_id UUID FOREIGN KEY,
  cve_id UUID FOREIGN KEY,
  contextual_score NUMERIC,
  calculated_at TIMESTAMP
);

-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  organization_id UUID,
  title VARCHAR,
  status VARCHAR, -- open, investigating, resolved
  cve_ids VARCHAR[],
  assigned_to UUID FOREIGN KEY (users)
);

-- Playbooks
CREATE TABLE incident_playbooks (
  id UUID PRIMARY KEY,
  incident_id UUID FOREIGN KEY,
  cve_id UUID FOREIGN KEY,
  steps JSONB, -- Array of playbook steps
  estimated_time_to_resolve INT
);
```

### MongoDB Collections

```javascript
// Incident Logs
db.incident_logs.insertOne({
  _id: ObjectId,
  incident_id: "uuid",
  organization_id: "uuid",
  action: "created",
  timestamp: new Date(),
  actor_id: "uuid",
  details: { ... }
});

// Threat Intelligence
db.threat_logs.insertOne({
  _id: ObjectId,
  organization_id: "uuid",
  threat_type: "malware",
  indicators: [...],
  detected_at: new Date(),
  related_cves: [...]
});

// System Logs
db.system_logs.insertOne({
  _id: ObjectId,
  level: "info|warning|error|critical",
  message: "Log message",
  timestamp: new Date(),
  source: "service-name",
  metadata: { ... }
});
```

## Deployment Architecture

### Local Development

```bash
# Terminal 1 - PostgreSQL + MongoDB
docker-compose up postgres mongodb redis

# Terminal 2 - Express Backend
cd backend && npm run dev

# Terminal 3 - FastAPI Service
cd fastapi-service && python -m uvicorn app.main:app --reload

# Terminal 4 - Next.js Frontend
cd frontend && npm run dev
```

### Docker Compose Production

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: cyberguard_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/postgres-schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://cyberguard:password@postgres:5432/cyberguard_db
      MONGODB_URI: mongodb://mongodb:27017/cyberguard_logs
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - mongodb
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s

  fastapi:
    build: ./fastapi-service
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://cyberguard:password@postgres:5432/cyberguard_db
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
      NEXT_PUBLIC_FASTAPI_URL: http://localhost:8000

volumes:
  postgres_data:
  mongodb_data:
```

### Production Deployment

**Option 1: Kubernetes (Recommended)**
- Docker images for each service
- Helm charts for deployment
- Horizontal pod autoscaling
- Persistent volumes for databases
- Ingress controller for routing

**Option 2: Cloud Platforms**
- **AWS:** ECS/Fargate for services, RDS for PostgreSQL, DocumentDB for MongoDB
- **Google Cloud:** Cloud Run for services, Cloud SQL, Firestore
- **Azure:** Container Instances, Azure Database for PostgreSQL, Cosmos DB

## Performance Optimization

### Caching Strategy

1. **Database Query Results** (Redis, 5 minutes)
   - Risk scores for assets
   - CVE details
   - Dashboard statistics

2. **Enriched CVE Data** (Redis, 24 hours)
   - Normalized CVE information
   - Exploit probability

3. **User Profiles** (Redis, 1 hour)
   - User details and permissions
   - Organization settings

### Query Optimization

1. **Indexing**
   ```sql
   -- PostgreSQL indexes
   CREATE INDEX idx_assets_organization ON assets(organization_id);
   CREATE INDEX idx_risk_scores_asset ON risk_scores(asset_id);
   CREATE INDEX idx_cves_severity ON cves(severity);
   ```

2. **Pagination**
   - All list endpoints paginated (default 20 items)
   - Cursor-based pagination for large datasets

3. **Batch Processing**
   - CVE matching done in batches
   - Risk calculation queued for bulk operations

## Monitoring & Observability

### Logging

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info|warning|error|critical",
  "service": "express|fastapi|frontend",
  "message": "Descriptive message",
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "requestId": "correlation-id",
  "duration_ms": 150,
  "status_code": 200
}
```

### Key Metrics

- **Availability:** % of successful API requests
- **Response Time:** P50, P95, P99 latencies
- **Error Rate:** % of failed requests by error type
- **CVE Processing Time:** Time from fetch to storage
- **Risk Score Calculation:** Latency for score computation
- **ML Model Performance:** Accuracy, precision, recall

### Alerting

- Error rate > 1%
- Response latency P99 > 2 seconds
- Database connection pool exhausted
- CVE sync failures
- Playbook generation timeouts

## CI/CD Pipeline

```
┌─ Git Push
│
├─ Code Quality Checks
│  ├─ ESLint / Prettier
│  ├─ TypeScript type checking
│  └─ Pylint / Black
│
├─ Unit Tests
│  ├─ Jest (frontend)
│  ├─ Mocha/Chai (backend)
│  └─ Pytest (fastapi)
│
├─ Integration Tests
│  ├─ API endpoint tests
│  └─ Database migration tests
│
├─ Build
│  ├─ Frontend build
│  ├─ Backend build
│  └─ FastAPI build
│
├─ Security Scanning
│  ├─ Dependency vulnerability check
│  ├─ SAST analysis
│  └─ Container scanning
│
└─ Deploy
   ├─ Staging environment
   ├─ Smoke tests
   └─ Production environment
```

## Troubleshooting Guide

### Common Issues

1. **JWT Token Expired**
   - Use refresh token endpoint
   - Automatic refresh handled by client

2. **CVE Sync Failures**
   - Check NVD/OTX API keys
   - Verify network connectivity
   - Review rate limiting

3. **Risk Score Calculation Slow**
   - Check Redis cache hit rate
   - Verify FastAPI service health
   - Scale FastAPI replicas if needed

4. **Database Connection Issues**
   - Verify connection strings
   - Check database is running
   - Review connection pool settings

## Future Enhancements

1. **GraphQL API** - Alternative to REST for complex queries
2. **Real-time Websockets** - Live incident updates
3. **Multi-tenancy** - Enterprise support
4. **Advanced ML Models** - Custom threat detection
5. **SIEM Integration** - Connect with existing tools
6. **Compliance Reporting** - NIST, PCI-DSS reporting

## Documentation Files

- `BACKEND_SETUP.md` - Express backend detailed setup
- `FASTAPI_SETUP.md` - FastAPI microservice setup
- `scripts/postgres-schema.sql` - Database schema
- API documentation available at `/api/docs` (Swagger UI)

---

**Last Updated:** 2026-02-22
**Version:** 1.0.0
