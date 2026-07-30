import os
import sys

if os.name == "nt":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import logging
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import asyncio

from crew import CyberguardThreatIntelligenceIncidentResponseCrew as CyberGuardCrew
from job_store import jobs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CyberGuard AI Agent Service",
    description="Multi-agent threat intelligence and incident response pipeline",
    version="1.0.0",
)

_configured_origins = [
    "http://localhost:3000",
    "https://cyberguard-platform.vercel.app",
    os.getenv("NEXT_PUBLIC_APP_URL"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in _configured_origins if origin],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

AGENT_API_SECRET = os.getenv("AGENT_API_SECRET")
if not AGENT_API_SECRET:
    logger.warning("AGENT_API_SECRET is not set — all analysis endpoints will reject requests")


async def verify_api_key(x_api_key: Optional[str] = Header(default=None)):
    """Shared-secret check between the Next.js backend and this service."""
    if not AGENT_API_SECRET or x_api_key != AGENT_API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")

# Verbose CrewAI logging uses emoji; disable on Windows to avoid console crashes.
crew = CyberGuardCrew(verbose=os.name != "nt")

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
    current_step: Optional[int] = None  # number of the 5 pipeline tasks completed so far

# Routes

@app.get("/health")
def health_check():
    """Health check endpoint for Docker/load balancer."""
    return {"status": "healthy", "service": "cyberguard-ai", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.post("/api/agents/analyze", response_model=JobStatusResponse, status_code=202, dependencies=[Depends(verify_api_key)])
async def run_analysis(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Kick off the 5-agent analysis pipeline asynchronously.
    Returns a job_id immediately; poll /api/agents/jobs/{job_id} for results.
    
    Called by the Node.js backend after collecting fresh threat indicators.
    """
    job_id = request.run_id or f"cg-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"

    job = {
        "job_id": job_id,
        "status": "queued",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "result": None,
        "error": None,
        "current_step": 0,
    }
    jobs.set(job_id, job)

    # Run the crew pipeline in the background
    background_tasks.add_task(
        _run_pipeline,
        job_id=job_id,
        indicators=[i.dict() for i in request.indicators],
        assets=[a.dict() for a in request.assets],
    )

    logger.info(f"[Job {job_id}] Queued analysis: {len(request.indicators)} indicators, {len(request.assets)} assets")
    return job

@app.get("/api/agents/jobs/{job_id}", response_model=JobStatusResponse, dependencies=[Depends(verify_api_key)])
def get_job_status(job_id: str):
    """Poll this endpoint to check pipeline progress and retrieve results."""
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job


@app.post("/api/agents/score", dependencies=[Depends(verify_api_key)])
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
    jobs.update(job_id, status="running")
    logger.info(f"[Job {job_id}] Pipeline started")

    try:
        loop = asyncio.get_event_loop()
        # 10 minute timeout — 70b model needs ~2-3 min for tasks 4 and 5
        result = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: crew.run(indicators, assets, job_id=job_id)),
            timeout=600,
        )

        if isinstance(result, dict) and result.get("error"):
            jobs.update(
                job_id,
                status="failed",
                error=str(result["error"]),
                result=result,
                completed_at=datetime.now(timezone.utc).isoformat(),
            )
            logger.error(f"[Job {job_id}] Pipeline returned error: {result['error']}")
            return

        jobs.update(
            job_id,
            status="completed",
            result=result,
            completed_at=datetime.now(timezone.utc).isoformat(),
        )
        logger.info(f"[Job {job_id}] Pipeline completed successfully")

    except asyncio.TimeoutError:
        jobs.update(
            job_id,
            status="failed",
            error="Pipeline timed out after 5 minutes",
            completed_at=datetime.now(timezone.utc).isoformat(),
        )
        logger.error(f"[Job {job_id}] Pipeline timed out")

    except Exception as e:
        err_msg = str(e)
        if getattr(e, "__cause__", None):
            err_msg = f"{err_msg} — {e.__cause__}"
        jobs.update(
            job_id,
            status="failed",
            error=err_msg,
            completed_at=datetime.now(timezone.utc).isoformat(),
        )
        logger.error(f"[Job {job_id}] Pipeline failed: {err_msg}", exc_info=True)