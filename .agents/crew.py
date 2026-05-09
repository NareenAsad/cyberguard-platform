import json
import time
import logging
from datetime import datetime, timezone
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

# Delay between tasks (seconds) — lets TPM window reset
# 12,000 TPM limit: each task uses ~800-2500 tokens, so 30s gap is safe
INTER_TASK_DELAY = 30


class CyberGuardCrew:
    def __init__(self, verbose: bool = True):
        self.verbose = verbose

    def run(self, raw_indicators: list[dict], asset_inventory: list[dict]) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        logger.info(f"[CyberGuard] Starting pipeline at {now}")
        logger.info(f"[CyberGuard] {len(raw_indicators)} indicators | {len(asset_inventory)} assets")

        result = self._run_with_delays(raw_indicators, asset_inventory)

        # Parse output — handle all backtick fence variants the LLM might produce
        try:
            raw = result.raw if hasattr(result, 'raw') else str(result)
            clean = raw.strip()

            # Strip any opening fence: ```json, ```JSON, ``` etc.
            if clean.startswith("```"):
                lines = clean.split("\n")
                lines = lines[1:]  # drop first line (```json or ```)
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                clean = "\n".join(lines).strip()

            parsed = json.loads(clean)
        except (json.JSONDecodeError, AttributeError, ValueError):
            parsed = {"raw_output": str(result)}

        return {
            "metadata": {
                "run_id": f"cg-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "indicators_processed": len(raw_indicators),
                "assets_scanned": len(asset_inventory),
            },
            **parsed,
        }

    def _run_with_delays(self, raw_indicators, asset_inventory):
        """
        Run the crew pipeline with rate-limit protection.
        max_rpm=2 enforces 1 LLM call every 30s inside CrewAI.
        At 2,500 tokens/call × 2 calls/min = 5,000 TPM — well under 12k even
        if two agents fire back-to-back.
        On rate limit errors, exponential back-off: 60s / 120s / 180s.
        """
        tasks = create_tasks(raw_indicators, asset_inventory)

        crew = Crew(
            agents=[
                threat_intelligence_agent,
                vulnerability_assessment_agent,
                risk_analysis_agent,
                incident_response_agent,
                reporting_agent,
            ],
            tasks=tasks,
            process=Process.sequential,
            verbose=self.verbose,
            memory=False,   # disable memory — saves tokens on every call
            max_rpm=2,      # 2 requests/min = 1 call every 30s = safe for 12k TPM
        )

        max_retries = 4
        for attempt in range(max_retries):
            try:
                # Pre-flight delay on retries — let the TPM window fully reset
                if attempt > 0:
                    wait = 60 * attempt   # 60s, 120s, 180s
                    logger.warning(
                        f"[CyberGuard] Rate limit retry {attempt}/{max_retries - 1} — waiting {wait}s"
                    )
                    time.sleep(wait)

                result = crew.kickoff()
                logger.info("[CyberGuard] Pipeline completed successfully")
                return result

            except Exception as e:
                err = str(e).lower()
                is_rate_limit = "rate_limit" in err or "429" in err or "ratelimit" in err
                if is_rate_limit and attempt < max_retries - 1:
                    logger.warning(f"[CyberGuard] Rate limit hit on attempt {attempt + 1}")
                    continue
                raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    sample_indicators = [
        {"type": "cve", "value": "CVE-2021-44228", "source": "NVD", "confidence": 100},
        {"type": "ip",  "value": "45.33.32.156",   "source": "OTX", "confidence": 85},
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
    ]

    crew_runner = CyberGuardCrew(verbose=True)
    output = crew_runner.run(sample_indicators, sample_assets)
    print(json.dumps(output, indent=2))