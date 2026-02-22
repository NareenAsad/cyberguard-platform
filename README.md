# 🛡️ CyberGuard: AI-Driven Threat Intelligence and Incident Response System

An enterprise-grade, AI-powered cybersecurity platform that revolutionizes security operations through intelligent automation, contextual risk assessment, and real-time threat monitoring — built as a Final Year Project at Lahore University for Women University.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.2-red)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-24.x-blue)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🎯 Overview

CyberGuard addresses critical gaps in modern cybersecurity by providing a unified platform that:

- **Aggregates Threat Intelligence** from multiple authoritative sources (NVD, AlienVault OTX, ThreatFox, URLhaus, AbuseIPDB)
- **AI-Powered Risk Analysis** using multi-agent architecture for contextual threat prioritization
- **Intelligent Incident Response** with automated playbook generation using LLM technology (Groq + LangChain + Llama 3.1)
- **Real-Time Monitoring Dashboard** with live visualizations, WebSocket updates, and global attack maps
- **Enterprise-Grade Security** at less than 5% the cost of traditional SOAR platforms
- **Explainable AI** — transparent reasoning chains so security teams can trust automated decisions

### 📊 Key Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Threat Detection Time Reduction (MTTD) | 70% | 🟡 In Development |
| Incident Response Time Reduction (MTTR) | 60% | 🟡 In Development |
| Vulnerability Identification Accuracy | 95%+ | 🟡 In Development |
| Daily Threat Indicators Processed | 10,000+ | 🟡 In Development |
| Cost vs Traditional SOAR Platforms | <5% | ✅ Achieved |

---

## ✨ Key Features

### 🤖 Multi-Agent AI System
Five specialized AI agents working collaboratively via CrewAI:
- **Threat Intelligence Agent** — Continuous monitoring, correlation, and enrichment
- **Vulnerability Assessment Agent** — Asset-to-CVE mapping using CPE matching
- **Risk Analysis Agent** — Context-aware prioritization using CVSS + MITRE ATT&CK
- **Incident Response Agent** — AI-generated step-by-step playbooks via LangChain + Groq
- **Reporting Agent** — Multi-format documentation for technical and executive audiences

### 📊 Real-Time Dashboard
- Live global threat map with geographic attack visualization
- Color-coded prioritized alert feed (critical, warning, informational)
- Threat activity trend charts with 24h / 7d / 30d views
- WebSocket-powered instant updates via Socket.io

### 🎯 Contextual Risk Scoring
- CVSS base score + temporal metrics integration
- Business impact and asset criticality consideration
- Active exploit availability tracking
- MITRE ATT&CK framework mapping and tactic classification

### 📝 Automated Incident Response Playbooks
- AI-generated, scenario-specific response procedures
- Investigation, containment, eradication, and recovery steps
- Human-readable guidance tailored to each threat
- Reviewed and validated before execution

### 🔍 MITRE ATT&CK Integration
- Attack pattern and technique identification
- Tactic classification across 14 categories
- Threat actor behavior analysis
- Defensive gap assessment

### 📈 Multi-Format Reporting
- Executive summaries in business language
- Detailed technical reports with IoCs and timelines
- Compliance documentation (ISO 27001, NIST CSF)

### 🔐 Enterprise Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Analyst, Viewer)
- Per-organization data isolation
- bcrypt password hashing + comprehensive audit logging
- API key management for integrations

---

## 🚀 Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | App Router, SSR, static generation |
| React | 18 | UI components, hooks, context, suspense |
| TypeScript | 5.0 | Type safety across the codebase |
| Tailwind CSS | 3.4 | Utility-first styling system |
| Recharts | 2.10 | Data visualization and charts |
| Lucide React | Latest | Consistent icon system |
| Socket.io-client | 4.6 | Real-time WebSocket updates |

### Backend Services
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express.js | 20.x / 4.18 | Main REST API gateway and business logic |
| Python + FastAPI | 3.11 / 0.109 | AI agent microservice endpoints |
| Socket.io | 4.6 | Bidirectional real-time communication |

### AI & Machine Learning
| Technology | Purpose |
|---|---|
| CrewAI | Multi-agent orchestration and task delegation |
| LangChain 0.1 | LLM integration, prompt engineering, memory |
| Groq Cloud API | Ultra-fast Llama 3.1 inference (sub-second) |
| Exa API | Intelligent web search for threat research |
| scikit-learn | Risk scoring ML models |
| PyTorch | Threat detection model training |

### Databases
| Technology | Version | Purpose |
|---|---|---|
| MongoDB | 7.0 | Unstructured threat intelligence data |
| Supabase (PostgreSQL) | 15 | Structured app data, users, incidents, assets |
| Redis | 7.2 | Caching, session storage, real-time queues |

### External Threat Intelligence APIs
| API | Data Provided |
|---|---|
| NVD (National Vulnerability Database) | CVE data, CVSS scores, CPE identifiers |
| AlienVault OTX | Community threat intelligence, IoCs |
| ThreatFox | Malware indicators, C2 infrastructure |
| URLhaus | Malicious URL tracking |
| AbuseIPDB | IP reputation scores |
| MITRE ATT&CK | Threat taxonomy and attack patterns |

### DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| Docker 24.x + Docker Compose | Containerization and local orchestration |
| GitHub + GitHub Actions | Version control and CI/CD pipelines |
| Nginx | Reverse proxy, load balancing, SSL termination |
| AWS EC2 / DigitalOcean / GCP | Cloud production hosting |
| Prometheus + Grafana | Metrics collection and visualization |
| Sentry | Error tracking and alerting |
| Winston | Structured logging for Node.js |

### Development & Testing Tools
| Tool | Purpose |
|---|---|
| VS Code | Primary IDE (Python, TypeScript, Docker extensions) |
| Postman | API testing and documentation |
| Jest + React Testing Library | JavaScript/React unit testing |
| Pytest | Python unit testing with coverage |
| ESLint + Prettier | JavaScript code quality |
| Black | Python code formatting |
| Figma | UI/UX design and prototyping |

---

## 🏗️ Project Structure

```
cyberguard-platform/
├── docs/                          # 📚 Documentation
│   ├── architecture.md
│   ├── api.md
│   ├── setup.md
│   └── user-guide.md
│
├── src/                           # 🎨 Next.js Frontend
│   ├── app/                       # App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── threat-logs/
│   │   ├── incident-response/
│   │   ├── asset-inventory/
│   │   ├── threat-intelligence/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── layout/                # Sidebar, Header, MainLayout
│   │   ├── dashboard/             # StatsRow, Charts, Tables, Alerts
│   │   ├── incident-response/     # Incident tables and stats
│   │   ├── threat-intelligence/   # Threat detail panels and tables
│   │   ├── asset-inventory/       # Asset management components
│   │   └── ui/                    # Reusable: StatCard, SeverityBadge, etc.
│   │
│   ├── hooks/                     # useSocket.ts, useThreats.ts
│   ├── lib/                       # utils.ts, api.ts, constants.ts
│   ├── types/                     # index.ts (all TypeScript interfaces)
│   └── data/                      # Mock data: threats, incidents, alerts, assets
│
├── services/                      # 🐍 Backend Services
│   ├── ai-agents/                 # CrewAI agent implementations
│   │   ├── threat_intelligence_agent.py
│   │   ├── vulnerability_assessment_agent.py
│   │   ├── risk_analysis_agent.py
│   │   ├── incident_response_agent.py
│   │   └── reporting_agent.py
│   ├── workers/                   # Background data collection workers
│   └── connectors/                # NVD, OTX, ThreatFox, URLhaus, AbuseIPDB connectors
│
├── backend/                       # Express.js API (Node.js)
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── models/
│       └── middleware/
│
├── fastapi-service/               # Python AI Microservice
│   └── app/
│       ├── api/
│       ├── models/
│       ├── services/
│       └── main.py
│
├── tests/                         # 🧪 Test suites (Jest, Pytest, E2E)
├── public/                        # 🖼️ Static assets
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚦 Quick Start

### Prerequisites

- Node.js 20.x or higher
- Python 3.11 or higher
- Docker & Docker Compose
- Git

### 1. Clone & Install Frontend

```bash
git clone https://github.com/YOUR_USERNAME/cyberguard-platform.git
cd cyberguard-platform

npm install

cp .env.example .env.local
# Edit .env.local with your API keys (see Configuration section)

npm run dev
# Visit http://localhost:3000
```

### 2. Backend (Express.js) Setup

```bash
cd backend
npm install
cp .env.example .env
npm run db:init
npm run dev
# Runs on http://localhost:3001
```

### 3. FastAPI AI Microservice Setup

```bash
cd fastapi-service
python3.11 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
python -m uvicorn app.main:app --reload
# Runs on http://localhost:8000
# Swagger UI: http://localhost:8000/docs
```

### 4. Start Everything with Docker

```bash
docker-compose up -d

# Services available at:
# Frontend:    http://localhost:3000
# Backend API: http://localhost:3001/api
# FastAPI:     http://localhost:8000
# Swagger UI:  http://localhost:8000/docs
```

---

## ⚙️ Configuration

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_AI_PLAYBOOKS=true
NEXT_PUBLIC_ENABLE_RISK_SCORING=true
```

### Backend — `.env`

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/cyberguard_db
MONGODB_URI=mongodb://localhost:27017/cyberguard_logs
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-strong-secret-key
NVD_API_KEY=your-nvd-api-key
OTX_API_KEY=your-otx-api-key
FASTAPI_URL=http://localhost:8000
```

### FastAPI — `.env`

```env
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost:5432/cyberguard_db
MONGODB_URI=mongodb://localhost:27017/cyberguard_logs
REDIS_URL=redis://localhost:6379/0
EXPRESS_BACKEND_URL=http://localhost:3001/api
GROQ_API_KEY=your-groq-api-key
EXA_API_KEY=your-exa-api-key
OPENAI_API_KEY=your-openai-key
```

---

## 📡 API Reference

### Authentication
```
POST   /api/auth/register          # Create new account
POST   /api/auth/login             # Authenticate user
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # Logout user
GET    /api/auth/validate          # Validate token
```

### CVE & Threat Intelligence
```
GET    /api/cves                   # List CVEs
GET    /api/cves/{cveId}           # Get CVE details
GET    /api/cves/search            # Search CVEs
POST   /api/cves/sync              # Sync from NVD/OTX
POST   /api/cves/match-assets      # Match CVEs to assets
```

### Asset Management
```
GET    /api/assets                 # List assets
POST   /api/assets                 # Create asset
PUT    /api/assets/{assetId}       # Update asset
DELETE /api/assets/{assetId}       # Delete asset
POST   /api/assets/upload          # Bulk upload (CSV/JSON)
```

### Incident Response
```
GET    /api/incidents              # List incidents
POST   /api/incidents              # Create incident
PUT    /api/incidents/{id}         # Update incident
POST   /api/incidents/{id}/timeline # Add timeline event
GET    /api/playbooks/{id}         # Get AI playbook
POST   /api/playbooks/generate     # Generate AI playbook
```

### Risk & Analytics
```
GET    /api/risk-scores            # List risk scores
POST   /api/risk-scores/calculate  # Calculate contextual risk
GET    /api/dashboard/stats        # Dashboard statistics
GET    /api/dashboard/threat-activity # Threat trend data
```

### User & Settings
```
GET    /api/users/profile          # Get user profile
PUT    /api/users/profile          # Update profile
GET    /api/users/api-keys         # List API keys
POST   /api/users/api-keys         # Create API key
DELETE /api/users/api-keys/{keyId} # Delete API key
```

Full interactive API documentation at `http://localhost:8000/docs` (Swagger UI).

---

## 🧪 Testing

```bash
# Frontend tests
npm test

# Tests in watch mode
npm run test:watch

# With coverage report
npm run test:coverage

# Backend tests
cd backend && npm test

# Python AI service tests
cd fastapi-service && pytest

# End-to-End tests
npm run test:e2e
```

---

## 🌐 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` and `ENVIRONMENT=production`
- [ ] Use strong, unique JWT secrets
- [ ] Configure production database credentials
- [ ] Enable HTTPS via Nginx + SSL certificate
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure automated backups
- [ ] Enable comprehensive logging (Winston + Sentry)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure rate limiting on all API routes
- [ ] Test disaster recovery procedures

### Cloud Hosting Options

| Provider | Frontend | Backend | Database |
|---|---|---|---|
| AWS | CloudFront + S3 / Amplify | ECS/Fargate | RDS + DocumentDB |
| Google Cloud | Cloud Storage + CDN | Cloud Run | Cloud SQL + Firestore |
| Azure | Static Web Apps | Container Instances | Azure DB + Cosmos DB |
| DigitalOcean | App Platform | Droplets | Managed DB |

---

## 📋 Project Information

### 🎓 Academic Context

| Field | Details |
|---|---|
| Project Type | Final Year Project (FYP) |
| Degree | Bachelor of Science (Software Engineering) |
| Institution | Lahore University for Women University (LWUL) |
| Session | 2022 – 2026 |
| Current Phase | Development & Implementation (Semester 2) |

### 👥 Team Members

| Student ID | Name | Role |
|---|---|---|
| 2225165090 | **Anber Aziz** | AI/ML & Backend |
| 2225165126 | **Minahil Irfan** | Frontend & UI/UX |
| 2225165131 | **Nareen Asad** | Backend & APIs |
| 2225165139 | **Sunbal Aziz** | Frontend & Testing |

### 🧑‍🏫 Supervision

- **Supervisor**: Dr. Muhammad Mohsin Nazir
- **Title**: Head of Department, Software Engineering
- **Institution**: Lahore University for Women University

---

## 🗺️ Project Roadmap

### ✅ Completed — Semester 1
- [x] System architecture design and documentation
- [x] Technology stack finalization
- [x] Database schema design (PostgreSQL + MongoDB)
- [x] Full API endpoint specification
- [x] UI/UX mockups and high-fidelity prototypes (Figma)
- [x] Literature review and research gap analysis
- [x] Functional proof-of-concept

### 🚧 In Progress — Semester 2 (Current)
- [ ] Frontend dashboard implementation (Next.js)
- [ ] Backend REST API development (Express.js)
- [ ] AI agent integration (CrewAI + LangChain + Groq)
- [ ] Database setup, migrations, and seeding
- [ ] Real-time WebSocket implementation (Socket.io)
- [ ] JWT authentication and RBAC system
- [ ] Multi-source threat intelligence connectors

### 📅 Upcoming
- [ ] Comprehensive testing (Unit, Integration, E2E)
- [ ] Performance optimization and load testing
- [ ] Security audit and penetration testing
- [ ] Production cloud deployment
- [ ] User acceptance testing with security professionals
- [ ] Final documentation and presentation
- [ ] GraphQL API for complex queries
- [ ] SIEM integration (Wazuh, Splunk)
- [ ] Compliance reporting (NIST, PCI-DSS)
- [ ] Mobile alert notifications

---

## ⚠️ Important Notes

### Educational Purpose
This system is designed primarily for educational and research purposes. While it implements real cybersecurity concepts and technologies, it should be:
- ✅ Used as a learning and research tool
- ✅ Evaluated in controlled, non-production environments
- ✅ Validated by security professionals before any production use
- ❌ NOT relied upon as a sole security solution
- ❌ NOT deployed without proper security review

### AI-Generated Content
AI-generated incident response playbooks must always be:
- Reviewed by qualified security professionals
- Validated against organizational policies
- Tested in non-production environments first
- Approved by management before executing critical actions

### Data Privacy
CyberGuard processes potentially sensitive security data. Ensure compliance with GDPR and relevant local data protection regulations, implement proper access controls, encrypt all data in transit and at rest, and conduct regular security audits.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit with descriptive messages (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

---

## 🔧 Troubleshooting

**Port already in use:**
```bash
lsof -i :3001   # Find process
kill -9 <PID>   # Kill process
```

**Database connection error:**
```bash
psql -U cyberguard -d cyberguard_db -h localhost
mongosh mongodb://localhost:27017
```

**CVE sync failures:** Verify your NVD and OTX API keys, check internet connectivity, and review rate limiting policies for free-tier API usage.

**API token expired:** Use the `/api/auth/refresh` endpoint. The frontend handles token refresh automatically.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture Overview](./docs/architecture.md) | System design, components, and data flows |
| [API Documentation](./docs/api.md) | Complete REST API reference |
| [Development Setup](./docs/setup.md) | Local environment configuration |
| [User Guide](./docs/user-guide.md) | End-user tutorials and workflows |
| [Interactive Swagger UI](http://localhost:8000/docs) | Live API testing interface |

---

## 🙏 Acknowledgments

- **NVD / NIST** — CVE vulnerability data and cybersecurity guidelines
- **AlienVault / Abuse.ch** — Open threat intelligence feeds
- **MITRE Corporation** — ATT&CK framework for threat taxonomy
- **CrewAI & LangChain Teams** — Multi-agent and LLM integration frameworks
- **Groq** — Ultra-fast LLM inference infrastructure
- **Open-source security community** — Tools, libraries, and research

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the CyberGuard Team**

🎓 Lahore University for Women University, Lahore — Software Engineering Department

**Version:** 1.0.0 &nbsp;|&nbsp; **Status:** In Active Development &nbsp;|&nbsp; **Last Updated:** February 2026

</div>