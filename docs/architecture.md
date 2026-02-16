# System Architecture

## Overview

CyberGuard employs a microservices-based architecture organized into five primary layers, designed for scalability, maintainability, and independent component evolution.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│                     (Next.js Web Dashboard)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│                  (Node.js REST API + Services)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                        AI AGENT LAYER                            │
│              (Python + CrewAI + LangChain-Groq)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐ │
│  │  Threat  │ │Vulnerabi-│ │   Risk   │ │ Incident │ │Report-│ │
│  │  Intel   │ │   lity   │ │ Analysis │ │ Response │ │  ing  │ │
│  │  Agent   │ │Assessment│ │  Agent   │ │  Agent   │ │ Agent │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                    DATA COLLECTION LAYER                         │
│              (API Connectors + Data Normalization)              │
│  ┌─────┐  ┌─────┐  ┌──────────┐  ┌────────┐  ┌────────────┐   │
│  │ NVD │  │ OTX │  │ThreatFox │  │URLhaus │  │ AbuseIPDB  │   │
│  └─────┘  └─────┘  └──────────┘  └────────┘  └────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                      DATA STORAGE LAYER                          │
│         ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│         │ MongoDB │    │Supabase │    │  Redis  │              │
│         │(Threats)│    │ (Users) │    │(Cache)  │              │
│         └─────────┘    └─────────┘    └─────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Details

### 1. Presentation Layer

**Technology**: Next.js 16 + React 18 + TypeScript + Tailwind CSS

**Components**:
- **Dashboard**: Real-time threat visualization, alert feed, risk metrics
- **Alert Management**: Incident investigation, response tracking
- **Asset Management**: Inventory viewing and editing
- **Reports**: Executive summaries, technical reports, compliance docs
- **Settings**: Configuration, user management, integrations

**Features**:
- Server-side rendering for performance
- Real-time updates via WebSocket (Socket.io)
- Responsive design for desktop and mobile
- Role-based UI access control

### 2. Business Logic Layer

**Technology**: Node.js + Express.js + TypeScript

**Services**:

```typescript
// Authentication Service
- User registration and login
- JWT token generation and validation
- Role-based access control (RBAC)
- Session management

// Asset Management Service
- CRUD operations for assets
- CSV import/export
- Asset categorization and tagging
- Version history tracking

// Alert Management Service
- Alert retrieval and filtering
- Priority queue management
- Incident assignment and tracking
- Status updates and resolution

// Configuration Service
- System settings management
- API credential storage (encrypted)
- Notification preferences
- Risk threshold configuration

// Integration Service
- Webhook endpoints for external systems
- SIEM connectors (bidirectional)
- RESTful API for programmatic access
- Event streaming
```

**API Structure**:
```
/api/v1/
├── auth/
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
├── assets/
│   ├── GET /assets
│   ├── POST /assets
│   ├── PUT /assets/:id
│   ├── DELETE /assets/:id
│   └── POST /assets/import
├── alerts/
│   ├── GET /alerts
│   ├── GET /alerts/:id
│   ├── PUT /alerts/:id/status
│   └── POST /alerts/:id/response
├── reports/
│   ├── GET /reports
│   ├── POST /reports/generate
│   └── GET /reports/:id/download
└── config/
    ├── GET /config
    └── PUT /config
```

### 3. AI Agent Layer

**Technology**: Python 3.11 + CrewAI + LangChain + Groq API

**Agent Architecture**:

#### Threat Intelligence Agent
```python
Role: Threat Intelligence Analyst
Goal: Monitor and filter relevant threats
Responsibilities:
- Poll data collection layer every 4 hours
- Filter low-confidence indicators
- Correlate threats across sources
- Enrich with geolocation, ASN data
- Identify threat campaigns
```

#### Vulnerability Assessment Agent
```python
Role: Vulnerability Analyst
Goal: Map CVEs to organizational assets
Responsibilities:
- Parse asset inventory (CPE matching)
- Cross-reference with NVD database
- Version range comparison
- Dependency analysis
- Generate vulnerability-asset mappings
```

#### Risk Analysis Agent
```python
Role: Risk Assessment Specialist
Goal: Prioritize threats by business impact
Scoring Algorithm:
- CVSS Base Score (40%)
- Exploit availability (20%)
- Asset criticality (20%)
- Network exposure (10%)
- Data sensitivity (10%)

Output: Risk score (0-100)
MITRE ATT&CK technique mapping
```

#### Incident Response Agent
```python
Role: Incident Response Coordinator
Goal: Generate actionable playbooks
Process:
1. Receive threat context from Risk Agent
2. Query LLM with structured prompt
3. Generate playbook sections:
   - Investigation procedures
   - Containment strategies
   - Eradication steps
   - Recovery procedures
   - Lessons learned
4. Validate completeness
5. Format for human readability
```

#### Reporting Agent
```python
Role: Security Reporter
Goal: Generate multi-format documentation
Report Types:
- Executive Summary (business language)
- Technical Report (detailed indicators)
- Compliance Report (ISO 27001, NIST CSF)

Features:
- Natural language generation
- Data visualization (charts, graphs)
- Customizable templates
```

**Agent Communication**:
```python
from crewai import Agent, Task, Crew

# Agent initialization
threat_agent = Agent(role="Threat Intel", ...)
vuln_agent = Agent(role="Vuln Assessment", ...)
risk_agent = Agent(role="Risk Analysis", ...)
incident_agent = Agent(role="Incident Response", ...)
report_agent = Agent(role="Reporting", ...)

# Task pipeline
threat_task = Task(description="Collect threats", agent=threat_agent)
vuln_task = Task(description="Map vulnerabilities", agent=vuln_agent)
risk_task = Task(description="Calculate risk", agent=risk_agent)
incident_task = Task(description="Generate playbook", agent=incident_agent)
report_task = Task(description="Create report", agent=report_agent)

# Execution
crew = Crew(agents=[...], tasks=[...], process="sequential")
result = crew.kickoff()
```

### 4. Data Collection Layer

**Connectors**:

```python
# NVD Connector
class NVDConnector:
    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    rate_limit = "50 requests per 30 seconds"
    
    def fetch_recent_cves(self, last_modified_date):
        # Query CVEs modified since last check
        # Parse JSON response
        # Normalize to internal schema
        # Store in MongoDB
        pass

# OTX Connector
class OTXConnector:
    base_url = "https://otx.alienvault.com/api/v1"
    
    def fetch_pulses(self, modified_since):
        # Retrieve threat pulses
        # Extract IoCs (IPs, domains, hashes)
        # Normalize and deduplicate
        pass

# ThreatFox Connector
class ThreatFoxConnector:
    base_url = "https://threatfox-api.abuse.ch/api/v1/"
    
    def fetch_malware_indicators(self):
        # Get recent malware IoCs
        # Extract C2 servers, file hashes
        pass

# URLhaus Connector
class URLhausConnector:
    base_url = "https://urlhaus-api.abuse.ch/v1/"
    
    def fetch_malicious_urls(self):
        # Retrieve malicious URLs
        # Parse payload information
        pass

# AbuseIPDB Connector
class AbuseIPDBConnector:
    base_url = "https://api.abuseipdb.com/api/v2/"
    
    def check_ip_reputation(self, ip_address):
        # Query IP reputation score
        # Get abuse confidence percentage
        pass
```

**Data Normalization**:
```python
# Unified threat indicator schema
{
    "indicator_id": "uuid",
    "type": "ip|domain|hash|url|cve",
    "value": "actual_value",
    "source": "nvd|otx|threatfox|urlhaus|abuseipdb",
    "confidence": 0.0-1.0,
    "severity": "critical|high|medium|low",
    "first_seen": "ISO8601_timestamp",
    "last_seen": "ISO8601_timestamp",
    "tags": ["malware", "botnet", "phishing"],
    "related_indicators": ["indicator_id"],
    "metadata": {
        "geolocation": {},
        "asn": "",
        "threat_actor": ""
    }
}
```

### 5. Data Storage Layer

#### MongoDB (Threat Intelligence)
```javascript
// Collections
threats_collection: {
    indicator_id, type, value, source,
    confidence, severity, timestamps,
    tags, metadata
}

campaigns_collection: {
    campaign_id, name, threat_actor,
    indicators[], first_seen, last_seen
}

enrichment_collection: {
    indicator_id, geolocation, asn,
    whois_data, dns_records
}
```

#### Supabase (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    cpe_string VARCHAR(255),
    criticality VARCHAR(20),
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    threat_indicator_id VARCHAR(255),
    asset_id UUID REFERENCES assets(id),
    severity VARCHAR(20),
    risk_score INTEGER,
    status VARCHAR(50),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Incident Response table
CREATE TABLE incident_responses (
    id UUID PRIMARY KEY,
    alert_id UUID REFERENCES alerts(id),
    playbook_text TEXT,
    steps_completed JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Redis (Caching)
```
# Cache structure
active_threats_cache: TTL=300s (5 minutes)
recent_alerts_cache: TTL=60s (1 minute)
user_sessions: TTL=3600s (1 hour)
rate_limit_counters: TTL=based on API limits
```

## Data Flow

### Threat Detection Workflow

```
1. Data Collection (Every 4 hours)
   ↓
2. Threat Intelligence Agent (Filter & Correlate)
   ↓
3. Vulnerability Assessment Agent (Map to Assets)
   ↓
4. Risk Analysis Agent (Score & Prioritize)
   ↓
5. Generate Alert (If risk_score > threshold)
   ↓
6. Store in Database + Cache
   ↓
7. WebSocket Notification to Dashboard
   ↓
8. User Views Alert
   ↓
9. Request Incident Response Playbook
   ↓
10. Incident Response Agent (Generate)
    ↓
11. User Reviews & Executes
    ↓
12. Update Alert Status
    ↓
13. Generate Report (On-demand or Scheduled)
```

## Security Considerations

1. **Authentication**: JWT tokens with refresh mechanism
2. **Authorization**: Role-based access control (RBAC)
3. **Data Encryption**: 
   - TLS 1.3 for all communications
   - AES-256 for sensitive data at rest
4. **API Security**: Rate limiting, API key rotation
5. **Input Validation**: Sanitize all user inputs
6. **Audit Logging**: Track all security-relevant actions

## Scalability Design

1. **Horizontal Scaling**: 
   - Stateless API servers (load balanced)
   - MongoDB sharding for large datasets
   
2. **Caching Strategy**:
   - Redis for frequently accessed data
   - CDN for static assets
   
3. **Async Processing**:
   - Message queues for long-running tasks
   - Background workers for report generation

## Monitoring & Observability

```
Metrics to Track:
- API response times
- Database query performance
- Alert processing latency
- Agent execution times
- Cache hit rates
- Error rates

Logging:
- Structured JSON logs
- Centralized log aggregation
- Log retention: 90 days
```

## Deployment Architecture

```
┌─────────────────┐
│   Load Balancer │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Nginx  │ (Reverse Proxy)
    └────┬────┘
         │
    ┌────┴──────────────────────┐
    │                           │
┌───┴────┐              ┌──────┴──────┐
│Next.js │              │  Node.js API│
│Frontend│              │   Backend   │
└────────┘              └──────┬──────┘
                               │
                      ┌────────┴────────┐
                      │                 │
                ┌─────┴─────┐    ┌─────┴──────┐
                │  Python   │    │ Databases  │
                │ AI Agents │    │   Cluster  │
                └───────────┘    └────────────┘
```

## Technology Justification

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Frontend | Next.js + React | SSR performance, modern dev experience |
| Backend API | Node.js + Express | Non-blocking I/O, JavaScript ecosystem |
| AI Agents | Python + CrewAI | Rich ML/AI libraries, agent framework |
| LLM | Groq + Llama 3.1 | Ultra-fast inference, cost-effective |
| Threat DB | MongoDB | Flexible schema for varied indicators |
| User DB | Supabase (PostgreSQL) | Relational integrity, built-in auth |
| Cache | Redis | Sub-millisecond latency |
| Real-time | Socket.io | Bidirectional event-based communication |

## Future Enhancements

1. **Machine Learning Models**: Anomaly detection, predictive analytics
2. **Mobile Application**: Native iOS/Android apps
3. **Advanced Integrations**: EDR tools, cloud security platforms
4. **Multi-tenancy**: Support for multiple organizations
5. **Automated Remediation**: Execute containment actions automatically

---

**Version**: 1.0  
**Last Updated**: February 2025  
**Maintained By**: CyberGuard Development Team
