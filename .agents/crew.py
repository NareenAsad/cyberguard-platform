import json
import logging
from datetime import datetime
from crewai import Crew, Process
from agents import (
    threat_intelligence_agent,
    vulnerability_assessment_agent,
    risk_analysis_agent,
    incident_response_agent,
    reporting_agent,
)
from tasks import create_tasks

logger = logging.getLogger(__name__)


class CyberGuardCrew:
    """
    Orchestrates the five-agent CyberGuard security analysis pipeline.
    
    Pipeline:
    1. Threat Intelligence Agent  → filters & enriches raw IoCs
    2. Vulnerability Agent        → cross-references CVEs with asset inventory
    3. Risk Analysis Agent        → computes weighted risk scores (0–100)
    4. Incident Response Agent    → generates NIST-aligned playbooks
    5. Reporting Agent            → produces executive + technical + compliance reports
    """

    def __init__(self, verbose: bool = True):
        self.verbose = verbose

    def run(
        self,
        raw_indicators: list[dict],
        asset_inventory: list[dict],
    ) -> dict:
        """
        Execute the full analysis pipeline.

        Args:
            raw_indicators: Fresh IoCs from data collection connectors
                            e.g. [{"type": "ip", "value": "1.2.3.4", "source": "OTX"}, ...]
            asset_inventory: Organization's assets from Supabase
                            e.g. [{"id": "asset-001", "name": "Web Server", "criticality": "CRITICAL"}, ...]

        Returns:
            dict with keys: threat_intel, vulnerabilities, risk_register,
                            playbooks, reports, metadata
        """
        logger.info(f"[CyberGuard] Starting analysis pipeline at {datetime.utcnow().isoformat()}")
        logger.info(f"[CyberGuard] Processing {len(raw_indicators)} indicators against {len(asset_inventory)} assets")

        # Build tasks with this run's data
        tasks = create_tasks(raw_indicators, asset_inventory)

        # Assemble the crew
        crew = Crew(
            agents=[
                threat_intelligence_agent,
                vulnerability_assessment_agent,
                risk_analysis_agent,
                incident_response_agent,
                reporting_agent,
            ],
            tasks=tasks,
            process=Process.sequential,   # agents run in order; each passes context forward
            verbose=self.verbose,
            memory=True,                  # agents remember findings from earlier tasks
            max_rpm=30,                   # Groq rate limit guard
        )

        # Kick off the pipeline
        result = crew.kickoff()

        # Parse structured output from the final reporting agent
        try:
            if isinstance(result, str):
                # Strip markdown code fences if present
                clean = result.strip().removeprefix("```json").removesuffix("```").strip()
                parsed_result = json.loads(clean)
            else:
                parsed_result = result
        except (json.JSONDecodeError, AttributeError):
            parsed_result = {"raw_output": str(result)}

        # Wrap with metadata
        output = {
            "metadata": {
                "run_id": f"cg-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
                "processed_at": datetime.utcnow().isoformat(),
                "indicators_processed": len(raw_indicators),
                "assets_scanned": len(asset_inventory),
                "pipeline_steps": 5,
            },
            **parsed_result,
        }

        logger.info(f"[CyberGuard] Pipeline complete. Run ID: {output['metadata']['run_id']}")
        return output


# ─────────────────────────────────────────────
# FastAPI endpoint wrapper (called by Node.js)
# ─────────────────────────────────────────────
# In your FastAPI service (main.py), expose like this:
#
# from fastapi import FastAPI
# from crew import CyberGuardCrew
#
# app = FastAPI()
# crew = CyberGuardCrew()
#
# @app.post("/api/agents/analyze")
# async def run_analysis(payload: AnalysisRequest):
#     result = crew.run(
#         raw_indicators=payload.indicators,
#         asset_inventory=payload.assets,
#     )
#     return result
# ─────────────────────────────────────────────


# ─── Quick local test ─────────────────────────
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Sample data for testing
    sample_indicators = [
        {"type": "ip", "value": "45.33.32.156", "source": "OTX", "confidence": 85},
        {"type": "cve", "value": "CVE-2021-44228", "source": "NVD"},  # Log4Shell
        {"type": "domain", "value": "malicious-c2-server.com", "source": "ThreatFox"},
        {"type": "hash", "value": "44d88612fea8a8f36de82e1278abb02f", "source": "ThreatFox"},
    ]

    sample_assets = [
        {
            "id": "asset-001",
            "name": "Production Web Server",
            "ip_address": "10.0.1.10",
            "os": "Ubuntu 22.04",
            "software": [{"name": "Apache Log4j", "version": "2.14.0"}],
            "criticality": "CRITICAL",
            "network_exposure": "internet-facing",
        },
        {
            "id": "asset-002",
            "name": "Internal Database",
            "ip_address": "10.0.1.20",
            "os": "Ubuntu 22.04",
            "software": [{"name": "PostgreSQL", "version": "14.5"}],
            "criticality": "HIGH",
            "network_exposure": "internal",
        },
    ]

    crew = CyberGuardCrew(verbose=True)
    output = crew.run(sample_indicators, sample_assets)
    print(json.dumps(output, indent=2))