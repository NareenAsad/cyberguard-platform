# Development Setup Guide

## Prerequisites

Before setting up the CyberGuard development environment, ensure you have the following installed:

### Required Software

- **Node.js**: v20.x LTS or higher
  - Download: https://nodejs.org/
  - Verify: `node --version`
  
- **npm**: v10.x or higher (comes with Node.js)
  - Verify: `npm --version`

- **Python**: 3.11 or higher
  - Download: https://www.python.org/downloads/
  - Verify: `python --version` or `python3 --version`

- **Git**: Latest version
  - Download: https://git-scm.com/
  - Verify: `git --version`

- **Docker**: Latest version (for containerized databases)
  - Download: https://www.docker.com/get-started
  - Verify: `docker --version`

- **Docker Compose**: v2.x or higher
  - Usually comes with Docker Desktop
  - Verify: `docker compose version`

### Recommended Tools

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Python
  - Docker
  - GitLens

- **Postman** or **Insomnia**: For API testing
  - Download: https://www.postman.com/ or https://insomnia.rest/

- **MongoDB Compass**: GUI for MongoDB
  - Download: https://www.mongodb.com/products/compass

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/YOUR_USERNAME/cyberguard-platform.git

# OR clone via SSH
git clone git@github.com:YOUR_USERNAME/cyberguard-platform.git

# Navigate to project directory
cd cyberguard-platform
```

### 2. Install Dependencies

#### Frontend & Backend (Node.js)

```bash
# Install Node.js dependencies
npm install

# This installs:
# - Next.js, React, TypeScript
# - Tailwind CSS
# - Recharts, Lucide React
# - Socket.io client
# - MongoDB, Supabase clients
# - And all other dependencies from package.json
```

#### AI Agents (Python)

```bash
# Navigate to Python services directory (will be created in FYP-II)
cd services/ai-agents

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# This installs:
# - crewai
# - langchain
# - groq
# - fastapi
# - uvicorn
# - mongodb drivers
# - And other AI/ML libraries
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Copy the example environment file
cp .env.example .env.local

# Open and edit with your values
nano .env.local  # or use your preferred editor
```

**Environment Variables**:

```env
# ===========================
# DATABASE CONFIGURATION
# ===========================

# MongoDB (Threat Intelligence Storage)
MONGODB_URI=mongodb://localhost:27017/cyberguard
MONGODB_DB_NAME=cyberguard

# Supabase (User & Asset Management)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (Caching)
REDIS_URL=redis://localhost:6379

# ===========================
# AI SERVICES
# ===========================

# Groq API (LLM for Incident Response)
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.1-70b-versatile

# Exa API (Web Research)
EXA_API_KEY=your-exa-api-key

# ===========================
# THREAT INTELLIGENCE APIs
# ===========================

# National Vulnerability Database
NVD_API_KEY=your-nvd-api-key

# AlienVault Open Threat Exchange
OTX_API_KEY=your-otx-api-key

# ThreatFox (Abuse.ch)
THREATFOX_API_KEY=  # No key required for public API

# URLhaus (Abuse.ch)
URLHAUS_API_KEY=  # No key required for public API

# AbuseIPDB
ABUSEIPDB_API_KEY=your-abuseipdb-api-key

# ===========================
# APPLICATION SETTINGS
# ===========================

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# ===========================
# OPTIONAL INTEGRATIONS
# ===========================

# Email Notifications (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Slack Webhook (for notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 4. Obtain API Keys

#### Groq API (Required)
1. Visit https://console.groq.com/
2. Sign up for free account
3. Navigate to API Keys section
4. Create new API key
5. Copy to `GROQ_API_KEY` in `.env.local`

#### Supabase (Required)
1. Visit https://supabase.com/
2. Create new project
3. Go to Settings > API
4. Copy URL to `NEXT_PUBLIC_SUPABASE_URL`
5. Copy anon key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy service_role key to `SUPABASE_SERVICE_ROLE_KEY`

#### National Vulnerability Database (Required)
1. Visit https://nvd.nist.gov/developers/request-an-api-key
2. Request free API key (2-3 days approval)
3. Copy to `NVD_API_KEY`

#### AlienVault OTX (Required)
1. Visit https://otx.alienvault.com/
2. Create free account
3. Go to Settings > API Integration
4. Copy API key to `OTX_API_KEY`

#### AbuseIPDB (Required)
1. Visit https://www.abuseipdb.com/
2. Create free account
3. Go to Account > API
4. Generate API key
5. Copy to `ABUSEIPDB_API_KEY`

#### Exa API (Optional)
1. Visit https://exa.ai/
2. Sign up and get API key
3. Copy to `EXA_API_KEY`

---

## Database Setup

### Option 1: Docker Compose (Recommended)

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: cyberguard-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: cyberguard
    volumes:
      - mongodb_data:/data/db
    networks:
      - cyberguard-network

  redis:
    image: redis:7.2-alpine
    container_name: cyberguard-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - cyberguard-network

volumes:
  mongodb_data:
  redis_data:

networks:
  cyberguard-network:
    driver: bridge
```

Start databases:

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Option 2: Local Installation

#### MongoDB

**macOS**:
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Ubuntu/Debian**:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows**:
- Download installer from https://www.mongodb.com/try/download/community
- Run installer and follow setup wizard
- Start MongoDB service from Services panel

#### Redis

**macOS**:
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows**:
- Download from https://github.com/microsoftarchive/redis/releases
- Extract and run redis-server.exe

---

## Running the Application

### Development Mode

#### Start Frontend (Next.js)

```bash
# From project root
npm run dev

# Server starts at http://localhost:3000
```

This runs Next.js with:
- Hot module replacement (HMR)
- Fast refresh for React components
- Automatic TypeScript compilation
- API routes at `/api/*`

#### Start AI Agent Services (Python)

```bash
# Navigate to AI services
cd services/ai-agents

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Start FastAPI server
uvicorn main:app --reload --port 8000

# Server starts at http://localhost:8000
# API docs at http://localhost:8000/docs
```

#### Start Background Workers (Optional)

For threat intelligence polling:

```bash
# In separate terminal
cd services/workers
python threat_collector.py
```

### Full Stack Development

Use `tmux` or multiple terminal windows:

**Terminal 1** (Frontend):
```bash
npm run dev
```

**Terminal 2** (AI Services):
```bash
cd services/ai-agents
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 3** (Databases):
```bash
docker compose up
```

**Terminal 4** (Background Workers):
```bash
cd services/workers
python threat_collector.py
```

---

## Project Structure

```
cyberguard-platform/
├── src/                          # Next.js application
│   ├── app/                      # App Router pages
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/         # Dashboard pages
│   │   │   ├── page.tsx         # Main dashboard
│   │   │   ├── alerts/          # Alert management
│   │   │   ├── assets/          # Asset management
│   │   │   ├── reports/         # Reporting
│   │   │   └── settings/        # Configuration
│   │   ├── api/                 # API routes
│   │   │   ├── auth/
│   │   │   ├── alerts/
│   │   │   ├── assets/
│   │   │   └── reports/
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── dashboard/
│   │   │   ├── ThreatMap.tsx
│   │   │   ├── AlertFeed.tsx
│   │   │   └── RiskMetrics.tsx
│   │   ├── alerts/
│   │   │   ├── AlertList.tsx
│   │   │   ├── AlertDetails.tsx
│   │   │   └── PlaybookViewer.tsx
│   │   ├── assets/
│   │   │   ├── AssetList.tsx
│   │   │   ├── AssetForm.tsx
│   │   │   └── AssetDetails.tsx
│   │   └── ui/                  # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       └── Table.tsx
│   ├── lib/                     # Utility functions
│   │   ├── database/
│   │   │   ├── mongodb.ts       # MongoDB client
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   └── redis.ts         # Redis client
│   │   ├── auth/
│   │   │   ├── jwt.ts           # JWT utilities
│   │   │   └── middleware.ts    # Auth middleware
│   │   └── utils/
│   │       ├── api.ts           # API helpers
│   │       ├── formatters.ts    # Data formatters
│   │       └── validators.ts    # Input validation
│   └── types/                   # TypeScript types
│       ├── alert.ts
│       ├── asset.ts
│       ├── user.ts
│       └── threat.ts
├── services/                    # Backend services
│   ├── ai-agents/              # Python AI agents
│   │   ├── agents/
│   │   │   ├── threat_intelligence.py
│   │   │   ├── vulnerability_assessment.py
│   │   │   ├── risk_analysis.py
│   │   │   ├── incident_response.py
│   │   │   └── reporting.py
│   │   ├── main.py             # FastAPI app
│   │   ├── requirements.txt
│   │   └── tests/
│   ├── workers/                # Background jobs
│   │   ├── threat_collector.py
│   │   └── scheduler.py
│   └── connectors/             # API connectors
│       ├── nvd_connector.py
│       ├── otx_connector.py
│       ├── threatfox_connector.py
│       ├── urlhaus_connector.py
│       └── abuseipdb_connector.py
├── public/                      # Static assets
│   ├── images/
│   └── icons/
├── docs/                        # Documentation
│   ├── architecture.md
│   ├── api.md
│   ├── user-guide.md
│   └── setup.md
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example                # Example environment file
├── .env.local                  # Your local environment (not in git)
├── .gitignore
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/alert-dashboard

# Or for bug fixes
git checkout -b fix/alert-status-update
```

### 2. Make Changes

- Write code following the style guide
- Add comments for complex logic
- Create/update tests
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run unit tests
npm run test

# Run specific test file
npm run test -- AlertList.test.tsx
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add real-time alert feed component

- Implement WebSocket connection for live alerts
- Add severity filtering
- Create alert card component with actions
- Add unit tests for AlertFeed component"

# Push to remote
git push origin feature/alert-dashboard
```

**Commit Message Conventions**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### 5. Create Pull Request

1. Go to GitHub repository
2. Click "Pull Request"
3. Select your branch
4. Fill in PR template:
   - Description of changes
   - Testing performed
   - Screenshots (if UI changes)
5. Request review from team members
6. Address review comments
7. Merge after approval

---

## Testing

### Unit Tests (Jest + React Testing Library)

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test AlertList.test.tsx
```

**Example Test**:

```typescript
// src/components/alerts/__tests__/AlertList.test.tsx
import { render, screen } from '@testing-library/react';
import AlertList from '../AlertList';

describe('AlertList', () => {
  it('renders alert items correctly', () => {
    const alerts = [
      { id: '1', title: 'Test Alert', severity: 'high' }
    ];
    
    render(<AlertList alerts={alerts} />);
    
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });
});
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests (Playwright)

```bash
# Install Playwright
npx playwright install

# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

### Python Tests (pytest)

```bash
cd services/ai-agents
pytest

# With coverage
pytest --cov=agents

# Run specific test
pytest tests/test_threat_intelligence.py
```

---

## Code Quality

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Python linting
cd services/ai-agents
pylint agents/
```

### Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting
npm run format:check

# Python formatting
cd services/ai-agents
black .
```

### Type Checking

```bash
# TypeScript type checking
npm run type-check

# Python type checking
cd services/ai-agents
mypy agents/
```

---

## Debugging

### Frontend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Backend Debugging (Python)

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use debugpy for VS Code
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()
```

### Database Debugging

**MongoDB**:
```bash
# Connect to MongoDB shell
mongosh

# Use CyberGuard database
use cyberguard

# View collections
show collections

# Query threats
db.threats.find().limit(10)
```

**Redis**:
```bash
# Connect to Redis CLI
redis-cli

# View all keys
KEYS *

# Get value
GET active_threats_cache
```

---

## Common Issues & Solutions

### Issue: Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
npm run dev -- -p 3001
```

### Issue: MongoDB Connection Failed

**Error**: `MongoServerError: connect ECONNREFUSED`

**Solution**:
```bash
# Check if MongoDB is running
docker compose ps  # If using Docker
# or
brew services list  # If using Homebrew

# Start MongoDB
docker compose up -d mongodb
# or
brew services start mongodb-community
```

### Issue: Module Not Found

**Error**: `Cannot find module '@/components/AlertList'`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Issue: Python Package Import Error

**Error**: `ModuleNotFoundError: No module named 'crewai'`

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

---

## Deployment (Production)

### Build Application

```bash
# Build Next.js for production
npm run build

# Start production server
npm run start
```

### Environment Variables (Production)

```env
# Use production URLs and keys
NEXT_PUBLIC_APP_URL=https://cyberguard.yourcompany.com
NODE_ENV=production

# Use strong secrets
JWT_SECRET=<generate-strong-random-string>

# Production database URLs
MONGODB_URI=mongodb://user:pass@prod-mongodb:27017/cyberguard
REDIS_URL=redis://prod-redis:6379
```

### Docker Deployment

```bash
# Build Docker image
docker build -t cyberguard-platform .

# Run container
docker run -p 3000:3000 --env-file .env.production cyberguard-platform
```

---

## Resources

### Official Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- CrewAI: https://docs.crewai.com/
- LangChain: https://python.langchain.com/docs/

### CyberGuard Resources
- Architecture: [/docs/architecture.md](./architecture.md)
- API Reference: [/docs/api.md](./api.md)
- User Guide: [/docs/user-guide.md](./user-guide.md)
- GitHub Issues: https://github.com/YOUR_USERNAME/cyberguard-platform/issues

### Community
- Project Discord: [Link to your Discord]
- Team Slack: [Internal Slack workspace]
- Weekly Standup: Every Monday 10 AM

---

## Getting Help

If you encounter issues:

1. **Check Documentation**: Review this setup guide and other docs
2. **Search Issues**: Look for similar issues on GitHub
3. **Ask Team**: Post in team Slack/Discord
4. **Create Issue**: Open detailed bug report on GitHub

**When reporting issues, include**:
- Operating system and version
- Node.js, Python versions
- Error message (full stack trace)
- Steps to reproduce
- Screenshots (if applicable)

---

**Setup Guide Version**: 1.0  
**Last Updated**: February 2025  
**Maintained By**: CyberGuard Development Team
