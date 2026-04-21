import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import asyncio
from dotenv import load_dotenv

load_dotenv("../.env.local")

from crew import CyberGuardCrew

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CyberGuard - AI-Driven Threat Intelligence and Incident Response System",
    description="Enterprise cybersecurity threat detection and incident response platform with real-time monitoring",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", os.getenv("NEXT_PUBLIC_APP_URL", "*")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# In-memory job store (replace with Redis in production)
jobs: dict[str, dict] = {}
crew = CyberGuardCrew(verbose=True)

# Request / Response Models

class ThreatIndicator(BaseModel):
    type: str = Field(..., description="ip | domain | hash | cve | url")
    value: str
    source: str = Field(..., description="OTX | ThreatFox | URLhaus | AbuseIPDB | NVD")
    confidence: Optional[int] = Field(default=None, ge=0, le=100)

class Asset(BaseModel):
    id: str
    name: str
    type: Optional[str] = "unknown"
    ip_address: Optional[str] = None
    os: Optional[str] = None
    software: Optional[list[dict]] = []
    criticality: str = Field(..., description="CRITICAL | HIGH | MEDIUM | LOW")
    network_exposure: str = Field(default="internal", description="internet-facing | internal | air-gapped")
    owner: Optional[str] = None

class AnalysisRequest(BaseModel):
    indicators: list[ThreatIndicator]
    assets: list[Asset]
    run_id: Optional[str] = None

class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # queued | running | completed | failed
    created_at: str
    completed_at: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None

# Routes

@app.get("/health")
def health_check():
    """Health check endpoint for Docker/load balancer."""
    return {"status": "healthy", "service": "cyberguard-ai", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/agents/analyze", response_model=JobStatusResponse, status_code=202)
async def run_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Kick off the 5-agent analysis pipeline asynchronously.
    Returns a job_id immediately; poll /api/agents/jobs/{job_id} for results.
    
    Called by the Node.js backend after collecting fresh threat indicators.
    """
    job_id = request.run_id or f"cg-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
    
    jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "created_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "result": None,
        "error": None,
    }

    # Run the crew pipeline in the background
    background_tasks.add_task(
        _run_pipeline,
        job_id=job_id,
        indicators=[i.dict() for i in request.indicators],
        assets=[a.dict() for a in request.assets],
    )

    logger.info(f"[Job {job_id}] Queued analysis: {len(request.indicators)} indicators, {len(request.assets)} assets")
    return jobs[job_id]


@app.get("/api/agents/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """Poll this endpoint to check pipeline progress and retrieve results."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return jobs[job_id]


@app.post("/api/agents/score")
def calculate_risk_score(payload: dict):
    """
    Synchronous single-item risk score calculation.
    For quick scoring without running the full pipeline.
    
    Payload: { cvss_score, exploit_availability, asset_criticality, 
               active_exploitation, network_exposure }
    """
    from risk_engine_py import calculate_risk_score_py
    try:
        result = calculate_risk_score_py(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Background Task

async def _run_pipeline(job_id: str, indicators: list[dict], assets: list[dict]):
    """Execute the CrewAI pipeline and store the result."""
    jobs[job_id]["status"] = "running"
    logger.info(f"[Job {job_id}] Pipeline started")

    try:
        # Run in thread pool to avoid blocking the event loop
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: crew.run(indicators, assets)
        )

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = result
        jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
        logger.info(f"[Job {job_id}] Pipeline completed successfully")

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["completed_at"] = datetime.utcnow().isoformat()
        logger.error(f"[Job {job_id}] Pipeline failed: {e}")