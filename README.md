# 🛡️ CyberGuard: AI-Driven Threat Intelligence and Incident Response System

An enterprise-grade, AI-powered cybersecurity platform that revolutionizes security operations through intelligent automation, contextual risk assessment, and real-time threat monitoring — built as a Final Year Project at Lahore University for Women University.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ Project Status

| Component | Status | Details |
|-----------|--------|---------|
| **Frontend** | ✅ Complete | Next.js 16, React 19, responsive design |
| **Component Architecture** | ✅ Refactored | 20+ reusable components across 5 pages |
| **Database Integration** | ✅ Complete | Supabase Postgres with 6 tables |
| **API Layer** | ✅ Complete | 7 endpoints with DB-first approach + fallback |
| **Validation & Error Handling** | ✅ Complete | Input validation, parameterized queries, graceful degradation |
| **Documentation** | ✅ Complete | Setup guides, implementation summaries, checklists |
| **AI Agents** | 🚧 In Progress | CrewAI integration, LangChain, Groq API |
| **Real-time Updates** | 🚧 In Progress | WebSocket integration, Socket.io |

---

## 🎯 Key Features

### Dashboard
- Real-time metrics (threats detected, risk score, incidents, systems monitored)
- Threat activity trend chart with historical data
- Recent incidents list with status tracking
- Quick statistics overview
- Database-backed metrics with auto-refresh

### Risk Analysis
- Asset risk distribution visualization
- Prioritized risk ranking by severity
- Vulnerability counts and exposure time tracking
- Risk score breakdown and recommendations
- Sortable and filterable asset list

### Incident Response
- Active incident management with timeline
- Incident severity and status tracking
- Assignee and priority management
- Incident creation with validation
- Response playbook execution

### Playbooks
- Pre-built response procedures by category
- Full-text search across playbooks
- Step-by-step execution guidance
- Integration with incident response
- Execution history tracking

### Reports
- Security report generation and tracking
- Report type filtering (Security, Compliance, Threat)
- Status tracking (Completed, In Progress)
- Threat and resolution statistics
- Downloadable report management

### Enterprise Features
- Input validation on all forms
- Error handling with user-friendly messages
- Graceful fallback to mock data
- Responsive mobile design
- Dark theme optimized for security operations

---

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - App Router, SSR, static generation
- **React 19+** - Component composition with hooks
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 4.x** - Utility-first styling with design tokens
- **shadcn/ui** - High-quality reusable components
- **Recharts** - Interactive data visualization
- **Lucide React** - Consistent icon system

### Backend & Database
- **Next.js API Routes** - REST endpoints with validation
- **Supabase Postgres** - Managed PostgreSQL database
- **@supabase/supabase-js** - DB and auth client

### Database Tables
- `threats` - Threat indicators with severity/status
- `risk_analyses` - Asset risk assessments
- `incidents` - Security incidents with timeline
- `playbooks` - Incident response procedures
- `reports` - Generated security reports
- `dashboard_metrics` - Aggregated statistics

---

## 📂 Project Structure

```
cyberguard/
├── docs/                          # Documentation files
├── prisma/                        # Database schema
│   └── schema.prisma              # Prisma schema (6 tables)
├── public/                        # Static assets
├── scripts/                       # Database scripts
│   ├── init-db.ts                 # Initialize database
│   └── seed-db.ts                 # Seed initial data
├── src/                           # Source directory
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout with sidebar/header
│   │   ├── page.tsx               # Dashboard (refactored)
│   │   ├── risk-analysis/         # Risk analysis pages
│   │   ├── incident-response/     # Incident response pages
│   │   ├── playbooks/             # Playbooks pages
│   │   ├── reports/               # Reports pages
│   │   └── api/                   # Next.js API routes
│   │       ├── dashboard/
│   │       ├── threats/
│   │       ├── risk-analysis/
│   │       ├── incident-response/
│   │       ├── playbooks/
│   │       └── reports/
│   ├── components/                # Reusable React components
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── risk-analysis/
│   │   ├── incident-response/
│   │   ├── playbooks/
│   │   ├── reports/
│   │   ├── shared/
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/                     # React hooks
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   ├── lib/                       # Utilities & services
│   │   ├── db.ts                  # Database query functions (8)
│   │   ├── mock-data.ts           # Fallback mock data
│   │   ├── utils.ts               # Common utilities
│   │   └── constants.ts           # App constants
│   └── styles/                    # Global styles and design tokens
├── LICENSE                        # MIT License
└── README.md                      # Project documentation
```

---

## 🚦 Quick Start

### Prerequisites
- Node.js 20.x or higher
- Supabase project (free tier available)
- Git

### 1. Install & Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/cyberguard-platform.git
cd cyberguard-platform

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add Supabase variables to .env.local
# NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### 2. Initialize Database

```bash
# Create tables and schema
npm run db:init

# Seed with sample data
npm run db:seed

# Or do both at once
npm run db:setup
```

### 3. Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

The app now uses real PostgreSQL database! All endpoints query the database with automatic fallback to mock data if unavailable.

### Test API Endpoints

```bash
# Get dashboard metrics
curl http://localhost:3000/api/dashboard/metrics

# Get threats
curl "http://localhost:3000/api/threats?severity=high"

# Get risk analysis
curl "http://localhost:3000/api/risk-analysis?sortBy=riskLevel"

# Get incidents
curl http://localhost:3000/api/incident-response
```

---

## 🗄️ Database Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Get Supabase Credentials

1. Sign up at [supabase.com](https://supabase.com) (free tier)
2. Create a new project
3. Copy project URL + service role key
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### Database Tables

| Table | Columns | Purpose |
|-------|---------|---------|
| `threats` | id, title, severity, status, source, created_at | Threat tracking |
| `risk_analyses` | id, asset, risk_level, vulnerabilities, exposure_time | Risk assessment |
| `incidents` | id, title, description, severity, status, created_at | Incident management |
| `playbooks` | id, title, category, description, steps | Response procedures |
| `reports` | id, title, type, status, threats, resolved | Report generation |
| `dashboard_metrics` | id, threats_detected, risk_score, incidents_active | Dashboard stats |

---

## 📡 API Reference

### Database-Backed Endpoints

All endpoints use database-first approach with graceful fallback to mock data.

```bash
# Dashboard Metrics
GET /api/dashboard/metrics          # Real-time metrics (DB-backed)
GET /api/dashboard/chart-data       # Chart data aggregation

# Threats
GET /api/threats                    # List all threats
GET /api/threats?severity=high      # Filter by severity
GET /api/threats?status=active      # Filter by status
GET /api/threats?page=1&limit=10   # Pagination

# Risk Analysis
GET /api/risk-analysis              # List all risks
GET /api/risk-analysis?minRisk=50   # Filter by risk range
GET /api/risk-analysis?sortBy=riskLevel  # Sort options

# Incident Response
GET /api/incident-response          # List incidents
GET /api/incident-response?status=active
POST /api/incident-response         # Create incident (validated)

# Playbooks
GET /api/playbooks                  # List playbooks
GET /api/playbooks?category=malware # Filter by category
GET /api/playbooks?search=ransomware # Search playbooks

# Reports
GET /api/reports                    # List reports
GET /api/reports?type=security      # Filter by type
POST /api/reports                   # Generate report (validated)
```

---

## 🧪 Database Integration Features

### Input Validation
- POST endpoints validate required fields
- Return 400 Bad Request with error messages
- Prevents invalid data in database

### Error Handling
- Parameterized SQL queries (SQL injection prevention)
- Try-catch blocks on all database calls
- Graceful fallback to mock data on errors
- Warning headers in API responses indicate fallback mode

### Graceful Degradation
- If database unavailable, app still works with mock data
- Warning flag in API response: `_warning: "Using mock data - database unavailable"`
- No user-facing errors, seamless experience

### Database Queries (lib/db.ts)

```typescript
// 8 database query functions:
1. getDashboardMetrics()      # Aggregated metrics
2. getThreats()               # Threats with filters
3. getRisks()                 # Risk data with sorting
4. getIncidents()             # Incidents CRUD
5. createIncident()           # Create with validation
6. getPlaybooks()             # Playbooks with search
7. getReports()               # Reports with filters
```

---

## 🎨 Component Architecture

### Refactored Pages (20+ Components)

**Dashboard Page**
- `MetricsGrid` - 4-column metrics display
- `ThreatChart` - Line chart with trend data
- `RecentIncidents` - Table with status badges
- `QuickStats` - Statistics panels

**Risk Analysis Page**
- `RiskDistribution` - Bar chart visualization
- `RiskPrioritization` - Ranked asset list
- `RiskStatistics` - Summary cards

**Incident Response Page**
- `IncidentsList` - Sidebar selector
- `IncidentDetails` - Timeline and details

**Playbooks Page**
- `PlaybookCategories` - Category filter
- `PlaybooksGrid` - Grid layout

**Reports Page**
- `ReportFilters` - Filter sidebar
- `ReportsList` - Report list

### Shared Components
- `PageHeader` - Title and description
- `LoadingSkeleton` - Loading states
- `Sidebar` - Navigation
- `Header` - Top bar

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Database setup guide |
| [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) | Step-by-step integration checklist |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Technical implementation details |
| [COMPLETION_REPORT.md](./COMPLETION_REPORT.md) | Project completion status |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add Supabase environment variables
4. Deploy with one click

### Environment Variables (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NODE_ENV=production
```

---

## ⚠️ Important Notes

### Educational Purpose
This system is designed for educational and research purposes. While it implements real cybersecurity concepts, it should be:
- ✅ Used as a learning tool
- ✅ Evaluated in controlled environments
- ✅ Validated by security professionals before production
- ❌ NOT relied upon as sole security solution

### Data Privacy
- Implements proper access controls
- Encrypts data in transit (HTTPS)
- Secure database credentials management
- Regular security audits recommended

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Supabase** - Managed PostgreSQL + platform services
- **Vercel** - Next.js and deployment platform
- **shadcn/ui** - React component library
- **MITRE** - ATT&CK framework
- **Open-source community** - Tools and libraries

---

<div align="center">

**Built with ❤️ by the CyberGuard Team**

**Version:** 1.1.0 | **Status:** In Active Development | **Last Updated:** April 2026

**Database Integrated ✓** | **Components Refactored ✓** | **Validation & Error Handling ✓**

</div>
