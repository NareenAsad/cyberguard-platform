# CyberGuard FastAPI Microservice Setup Guide

This guide covers the Python FastAPI microservice that powers AI-driven risk scoring, CVE enrichment, threat detection, and playbook generation for CyberGuard.

## Architecture Overview

The FastAPI microservice handles:
- Risk score calculation with contextual analysis
- CVE enrichment and normalization from multiple sources
- Threat pattern detection using ML models
- AI-based incident response playbook generation
- Vulnerability prioritization algorithms
- Industry-specific threat assessment
- Historical trend analysis

## Prerequisites

- Python 3.10+
- pip or conda package manager
- Redis (for caching and job queues)
- PostgreSQL client libraries
- CUDA support optional (for GPU-accelerated ML models)

## Project Structure

```
fastapi-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   ├── api/
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── risk_scoring.py    # Risk score endpoints
│   │   │   │   ├── cve_enrichment.py  # CVE processing endpoints
│   │   │   │   ├── threat_detection.py # Threat detection endpoints
│   │   │   │   └── playbooks.py       # Playbook generation endpoints
│   │   │   └── router.py             # API router
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── risk_scorer.py  # Risk scoring model
│   │   │   ├── threat_detector.py # ML threat detection
│   │   │   └── playbook_generator.py # LLM-based generation
│   ├── services/
│   │   ├── __init__.py
│   │   ├── risk_service.py     # Risk calculation logic
│   │   ├── cve_service.py      # CVE enrichment
│   │   ├── threat_service.py   # Threat analysis
│   │   ├── playbook_service.py # Playbook logic
│   │   └── external_api.py     # External service calls
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── caching.py          # Redis caching
│   │   ├── validators.py       # Input validation
│   │   ├── logger.py           # Logging setup
│   │   ├── exceptions.py       # Custom exceptions
│   │   └── helpers.py          # Utility functions
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py             # API authentication
│   │   ├── cors.py             # CORS configuration
│   │   └── request_logging.py  # Request logging
│   └── db/
│       ├── __init__.py
│       ├── connection.py       # Database connections
│       └── queries.py          # Reusable queries
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_risk_scoring.py
│   ├── test_cve_enrichment.py
│   ├── test_threat_detection.py
│   └── test_playbooks.py
├── ml_models/
│   ├── __init__.py
│   ├── pretrained/             # Pre-trained models
│   │   ├── risk_model.pkl
│   │   ├── threat_detector.h5
│   │   └── embeddings.npy
│   └── training/
│       ├── train_risk_model.py
│       └── train_threat_detector.py
├── .env.example
├── .env
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
└── README.md
```

## Installation

### 1. Setup Python Environment

```bash
# Create virtual environment
python3.10 -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Upgrade pip
pip install --upgrade pip
```

### 2. Install Dependencies

```bash
# Install required packages
pip install fastapi uvicorn pydantic python-dotenv
pip install psycopg2-binary sqlalchemy
pip install redis celery
pip install numpy scikit-learn pandas
pip install requests httpx
pip install pytest pytest-asyncio
pip install python-multipart

# For LLM-based playbook generation
pip install openai langchain

# For ML models (optional GPU support)
pip install torch scikit-learn xgboost
```

Create `requirements.txt`:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
redis==5.0.1
celery==5.3.4
numpy==1.24.3
scikit-learn==1.3.2
pandas==2.1.3
requests==2.31.0
httpx==0.25.2
openai==1.3.9
langchain==0.1.0
pydantic-extra-types==2.4.0
pytest==7.4.3
pytest-asyncio==0.21.1
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
aioredis==2.0.1
```

### 3. Environment Configuration

Create `.env` file:

```env
# Server
ENVIRONMENT=development
DEBUG=true
HOST=0.0.0.0
PORT=8000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://cyberguard:password@localhost:5432/cyberguard_db
MONGODB_URI=mongodb://localhost:27017/cyberguard_logs

# Redis
REDIS_URL=redis://localhost:6379/0

# API Keys
EXPRESS_BACKEND_URL=http://localhost:3001/api
EXPRESS_API_KEY=your_internal_api_key

# External APIs
NVD_API_KEY=your_nvd_api_key
OTX_API_KEY=your_otx_api_key

# LLM Configuration
OPENAI_API_KEY=your_openai_api_key
MODEL_NAME=gpt-4
TEMPERATURE=0.7

# ML Model Configuration
RISK_MODEL_PATH=./ml_models/pretrained/risk_model.pkl
THREAT_DETECTOR_PATH=./ml_models/pretrained/threat_detector.h5

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Feature Flags
ENABLE_ML_THREAT_DETECTION=true
ENABLE_LLM_PLAYBOOKS=true
ENABLE_CACHING=true
```

## Core Components

### 1. Risk Scoring Engine

Calculates contextual risk scores based on:
- CVE base score
- Asset criticality
- Exploit availability
- Organization-specific factors
- Industry threat landscape
- Historical incident data

```python
# app/models/schemas.py
from pydantic import BaseModel
from typing import List, Dict

class RiskScoreRequest(BaseModel):
    cve_id: str
    asset_id: str
    asset_type: str
    asset_criticality: str  # critical, high, medium, low
    organization_id: str
    industry: Optional[str] = None
    context: Optional[Dict] = None

class RiskScoreResponse(BaseModel):
    asset_id: str
    cve_id: str
    base_score: float
    contextual_score: float
    risk_level: str  # critical, high, medium, low
    factors: Dict[str, float]
    recommendation: str
```

**Scoring Formula:**
```
contextual_score = (base_score * 0.4) + 
                   (asset_criticality_weight * 0.3) +
                   (exploit_availability_score * 0.15) +
                   (industry_threat_factor * 0.1) +
                   (recency_factor * 0.05)
```

### 2. CVE Enrichment Service

**Features:**
- Fetch CVE details from multiple sources
- Normalize data to standard format
- Extract key indicators
- Calculate exploit probability
- Identify affected assets

```python
# app/services/cve_service.py
async def enrich_cve(cve_id: str) -> EnrichedCVE:
    """
    Enrich CVE with data from multiple sources
    """
    # Fetch from NVD
    nvd_data = await fetch_nvd_cve(cve_id)
    
    # Fetch from OTX
    otx_data = await fetch_otx_cve(cve_id)
    
    # Merge and normalize
    enriched = merge_cve_data(nvd_data, otx_data)
    
    # Calculate metrics
    enriched.exploit_probability = calculate_exploit_probability(enriched)
    enriched.industry_prevalence = calculate_prevalence(cve_id)
    
    return enriched
```

### 3. Threat Detection with ML

**Algorithms:**
- Anomaly detection using Isolation Forest
- Pattern recognition with clustering
- Time-series analysis for trends
- Natural language processing for threat intelligence

```python
# app/models/ml/threat_detector.py
import numpy as np
from sklearn.ensemble import IsolationForest

class ThreatDetector:
    def __init__(self, model_path: str):
        self.model = load_model(model_path)
    
    async def detect_threats(self, 
                           vulnerability_data: np.ndarray,
                           historical_data: np.ndarray) -> List[Threat]:
        """
        Detect threat patterns using ML
        """
        # Combine features
        features = np.concatenate([vulnerability_data, historical_data], axis=1)
        
        # Detect anomalies
        predictions = self.model.predict(features)
        
        # Extract threat details
        threats = []
        for idx, pred in enumerate(predictions):
            if pred == -1:  # Anomaly detected
                threats.append(self._create_threat_from_prediction(idx, features[idx]))
        
        return threats
```

### 4. AI Playbook Generation

**Uses LLM for:**
- Natural language understanding of CVE context
- Step-by-step remediation planning
- Tool recommendation
- Timeline estimation
- Risk assessment

```python
# app/services/playbook_service.py
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate

async def generate_playbook(
    cve_id: str,
    asset_info: AssetInfo,
    organization_context: OrganizationContext
) -> IncidentPlaybook:
    """
    Generate AI-based incident response playbook
    """
    llm = OpenAI(model_name="gpt-4", temperature=0.7)
    
    prompt = PromptTemplate.from_template("""
    You are a cybersecurity incident response expert.
    
    CVE: {cve_id}
    Description: {cve_description}
    Severity: {severity}
    Affected Asset: {asset_name} ({asset_type})
    Asset Criticality: {criticality}
    Organization: {org_name}
    Industry: {industry}
    
    Generate a detailed incident response playbook with:
    1. Immediate containment steps
    2. Investigation procedures
    3. Remediation actions
    4. Verification steps
    5. Recovery procedures
    6. Post-incident analysis
    
    For each step, provide estimated time and required tools.
    Format as JSON.
    """)
    
    response = await llm.agenerate([prompt])
    playbook = parse_playbook_response(response)
    
    return playbook
```

## API Endpoints

### Risk Scoring

```
POST /api/v1/risk-score/calculate
{
    "cve_id": "CVE-2024-XXXXX",
    "asset_id": "asset-uuid",
    "asset_type": "server",
    "asset_criticality": "critical",
    "organization_id": "org-uuid"
}

Response: {
    "asset_id": "asset-uuid",
    "contextual_score": 87.5,
    "risk_level": "critical",
    "factors": {
        "base_score": 70.0,
        "criticality_factor": 0.9,
        "exploit_factor": 0.8
    }
}
```

### CVE Enrichment

```
POST /api/v1/cve/enrich
{
    "cve_id": "CVE-2024-XXXXX"
}

Response: {
    "cve_id": "CVE-2024-XXXXX",
    "description": "...",
    "severity": "HIGH",
    "base_score": 7.8,
    "exploit_probability": 0.85,
    "affected_products": [...],
    "references": [...]
}
```

### Threat Detection

```
POST /api/v1/threat/detect
{
    "organization_id": "org-uuid",
    "vulnerability_data": [...]
}

Response: {
    "threats_detected": 3,
    "threats": [
        {
            "threat_id": "threat-uuid",
            "type": "anomaly",
            "severity": "high",
            "confidence": 0.92
        }
    ]
}
```

### Playbook Generation

```
POST /api/v1/playbook/generate
{
    "cve_id": "CVE-2024-XXXXX",
    "asset_id": "asset-uuid",
    "organization_id": "org-uuid"
}

Response: {
    "playbook_id": "playbook-uuid",
    "steps": [
        {
            "order": 1,
            "title": "Isolate affected system",
            "description": "...",
            "estimated_time": 5,
            "requires_manual_intervention": true
        }
    ],
    "estimated_time_to_resolve": 120,
    "automation_possible": true
}
```

## Running the Microservice

### Development

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Access API documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### Production

```bash
# Using Gunicorn
pip install gunicorn

gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120

# Or using systemd
# See systemd service example below
```

### Docker Deployment

```bash
# Build image
docker build -t cyberguard-fastapi .

# Run container
docker run -d \
    --name cyberguard-fastapi \
    -p 8000:8000 \
    --env-file .env \
    cyberguard-fastapi

# Using docker-compose
docker-compose up -d
```

## Caching Strategy

Use Redis for caching to improve performance:

```python
# app/utils/caching.py
import redis
import json
from typing import Any, Optional

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url, decode_responses=True)
    
    async def get(self, key: str) -> Optional[Any]:
        value = self.redis.get(key)
        return json.loads(value) if value else None
    
    async def set(self, key: str, value: Any, ttl: int = 3600):
        self.redis.setex(key, ttl, json.dumps(value))
    
    async def delete(self, key: str):
        self.redis.delete(key)

# Cache CVE enrichment for 24 hours
cache_key = f"cve:{cve_id}:enriched"
cached = await cache_manager.get(cache_key)
if not cached:
    enriched = await cve_service.enrich_cve(cve_id)
    await cache_manager.set(cache_key, enriched, ttl=86400)
```

## ML Model Management

### Training Models Locally

```bash
# Train risk model
python ml_models/training/train_risk_model.py \
    --data data/historical_risks.csv \
    --output ml_models/pretrained/risk_model.pkl

# Train threat detector
python ml_models/training/train_threat_detector.py \
    --data data/historical_threats.csv \
    --output ml_models/pretrained/threat_detector.h5
```

### Model Updates

```python
# app/services/risk_service.py
def load_model(model_path: str):
    """Load model with version checking"""
    import pickle
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    logger.info(f"Loaded model from {model_path}")
    return model
```

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_risk_scoring.py

# Run with coverage
pytest --cov=app tests/

# Run async tests
pytest -v -s tests/
```

Example test:

```python
# tests/test_risk_scoring.py
import pytest
from app.services.risk_service import RiskService

@pytest.mark.asyncio
async def test_calculate_risk_score():
    service = RiskService()
    
    result = await service.calculate_score(
        cve_id="CVE-2024-XXXXX",
        asset_criticality="critical"
    )
    
    assert result.contextual_score >= 0
    assert result.contextual_score <= 100
    assert result.risk_level in ["critical", "high", "medium", "low"]
```

## Monitoring

### Health Check Endpoint

```python
# app/api/v1/endpoints/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "cyberguard-fastapi",
        "timestamp": datetime.now().isoformat()
    }
```

### Logging Configuration

```python
# app/utils/logger.py
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {
            "timestamp": datetime.now().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module
        }
        return json.dumps(log_obj)

logger = logging.getLogger("cyberguard")
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

## Performance Optimization

1. **Async/Await:** All I/O operations are asynchronous
2. **Connection Pooling:** Database and Redis connection pooling
3. **Batch Processing:** Process CVEs in batches from external APIs
4. **Caching:** Redis cache for frequently accessed data
5. **Rate Limiting:** Implement rate limits for API endpoints

## Troubleshooting

**Model Loading Issues:**
```python
# Verify model exists
import os
model_path = "./ml_models/pretrained/risk_model.pkl"
if not os.path.exists(model_path):
    print(f"Model not found at {model_path}")
```

**Database Connection Errors:**
```bash
# Test PostgreSQL connection
psql postgresql://user:password@localhost:5432/cyberguard_db -c "SELECT 1"
```

**Redis Connection Issues:**
```bash
# Test Redis connection
redis-cli ping
```

## Integration with Express Backend

The FastAPI service is called by Express backend for:

1. **Risk Calculation**
```python
await httpx_client.post(
    f"{FASTAPI_URL}/api/v1/risk-score/calculate",
    json=risk_request,
    headers={"Authorization": f"Bearer {api_key}"}
)
```

2. **Playbook Generation**
```python
await httpx_client.post(
    f"{FASTAPI_URL}/api/v1/playbook/generate",
    json=playbook_request,
    headers={"Authorization": f"Bearer {api_key}"}
)
```

## Next Steps

1. Deploy FastAPI service to production
2. Train ML models with historical data
3. Integrate with Express backend API
4. Set up monitoring and alerting
5. Implement auto-scaling for high load
