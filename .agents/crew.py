import json
import re
import os
import time
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task

from tools import (
    nvd_search_tool,
    otx_threat_tool,
    asset_lookup_tool,
    mitre_lookup_tool,
)

logger = logging.getLogger(__name__)
load_dotenv(Path(__file__).parent.parent / ".env.local")

# Delay between tasks (seconds) — lets TPM window reset
INTER_TASK_DELAY = 30


def _extract_json(text: str) -> dict | list | None:
    """
    Robustly extract a JSON object or array from LLM output.
    """
    if not text:
        return None

    # 1. Direct parse
    try:
        return json.loads(text.strip())
    except (json.JSONDecodeError, ValueError):
        pass

    # 2. Strip markdown fences
    fence_match = re.search(r"```(?:json|JSON)?\s*\n([\s\S]*?)\n```", text)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            pass

    # 3. Find first { or [ and balance brackets
    for start_char, end_char in [('{', '}'), ('[', ']')]:
        start_idx = text.find(start_char)
        if start_idx == -1:
            continue
        depth = 0
        in_string = False
        escape_next = False
        for i, ch in enumerate(text[start_idx:], start=start_idx):
            if escape_next:
                escape_next = False
                continue
            if ch == '\\' and in_string:
                escape_next = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == start_char:
                depth += 1
            elif ch == end_char:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start_idx:i + 1])
                    except (json.JSONDecodeError, ValueError):
                        break

    return None


@CrewBase
class CyberguardThreatIntelligenceIncidentResponseCrew:
    """CyberguardThreatIntelligenceIncidentResponse crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        
        # Using Groq models instead of OpenAI
        self.llm = LLM(
            model="groq/llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=4096,
        )
        self.llm_powerful = self.llm

    @agent
    def threat_intelligence_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["threat_intelligence_analyst"],
            tools=[otx_threat_tool, mitre_lookup_tool, nvd_search_tool],
            allow_delegation=False,
            max_iter=3,
            llm=self.llm,
        )

    @agent
    def vulnerability_assessment_specialist(self) -> Agent:
        return Agent(
            config=self.agents_config["vulnerability_assessment_specialist"],
            tools=[nvd_search_tool, asset_lookup_tool],
            allow_delegation=False,
            max_iter=3,
            llm=self.llm,
        )

    @agent
    def risk_analysis_engineer(self) -> Agent:
        return Agent(
            config=self.agents_config["risk_analysis_engineer"],
            tools=[],
            allow_delegation=False,
            max_iter=2,
            llm=self.llm,
        )

    @agent
    def senior_incident_response_manager(self) -> Agent:
        return Agent(
            config=self.agents_config["senior_incident_response_manager"],
            tools=[],
            allow_delegation=False,
            max_iter=2,
            llm=self.llm_powerful,
        )

    @agent
    def security_reporting_specialist(self) -> Agent:
        return Agent(
            config=self.agents_config["security_reporting_specialist"],
            tools=[],
            allow_delegation=False,
            max_iter=3,
            llm=self.llm_powerful,
        )

    @task
    def threat_intelligence_analysis(self) -> Task:
        return Task(config=self.tasks_config["threat_intelligence_analysis"])

    @task
    def vulnerability_assessment(self) -> Task:
        return Task(config=self.tasks_config["vulnerability_assessment"])

    @task
    def risk_score_calculation(self) -> Task:
        return Task(config=self.tasks_config["risk_score_calculation"])

    @task
    def incident_response_playbook_generation(self) -> Task:
        return Task(config=self.tasks_config["incident_response_playbook_generation"])

    @task
    def comprehensive_security_reporting(self) -> Task:
        return Task(config=self.tasks_config["comprehensive_security_reporting"])

    @crew
    def crew(self) -> Crew:
        """Creates the CyberguardThreatIntelligenceIncidentResponse crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=self.verbose,
            task_callback=self.task_callback,
        )

    def task_callback(self, task_output) -> None:
        """
        Enforce delay between tasks to prevent Groq TPM rate limits.
        """
        logger.info(f"[CyberGuard] Task completed. Waiting {INTER_TASK_DELAY}s for TPM bucket reset...")
        time.sleep(INTER_TASK_DELAY)

    def run(self, raw_indicators: list[dict], asset_inventory: list[dict]) -> dict:
        """
        Custom wrapper for FastAPI to bridge JSON inputs to the YAML template inputs.
        """
        now = datetime.now(timezone.utc).isoformat()
        logger.info(f"[CyberGuard] Starting pipeline at {now}")
        logger.info(f"[CyberGuard] {len(raw_indicators)} indicators | {len(asset_inventory)} assets")

        inputs = {
            'target_organization': 'CyberGuard Platform',
            'threat_indicators': json.dumps(raw_indicators),
            'asset_inventory': json.dumps(asset_inventory)
        }

        max_retries = 4
        result = None
        for attempt in range(max_retries):
            try:
                if attempt > 0:
                    wait = 60 * attempt
                    logger.warning(f"[CyberGuard] Rate limit retry {attempt}/{max_retries - 1} — waiting {wait}s")
                    time.sleep(wait)

                c = self.crew()
                result = c.kickoff(inputs=inputs)
                logger.info("[CyberGuard] Pipeline completed successfully")
                break

            except Exception as e:
                err = str(e).lower()
                is_rate_limit = "rate_limit" in err or "429" in err or "ratelimit" in err
                if is_rate_limit and attempt < max_retries - 1:
                    logger.warning(f"[CyberGuard] Rate limit hit on attempt {attempt + 1}")
                    continue
                raise
        
        if result is None:
            return {"error": "Pipeline failed after maximum retries"}

        # Aggregated result structure
        aggregated = {
            "threats": [],
            "risk_register": [],
            "playbooks": [],
            "executive_report": {},
            "technical_report": {},
            "compliance_report": {},
        }

        # Extract data from all tasks in the sequence
        # Index 0: Threat Intel
        # Index 1: Vuln Assessment (Internal)
        # Index 2: Risk Scoring
        # Index 3: Playbooks
        # Index 4: Reporting
        
        if hasattr(result, 'tasks_output'):
            tasks = result.tasks_output
            
            if len(tasks) > 0:
                aggregated["threats"] = _extract_json(tasks[0].raw) or []
            
            if len(tasks) > 2:
                aggregated["risk_register"] = _extract_json(tasks[2].raw) or []
                
            if len(tasks) > 3:
                aggregated["playbooks"] = _extract_json(tasks[3].raw) or []
                
            if len(tasks) > 4:
                report_data = _extract_json(tasks[4].raw) or {}
                aggregated["executive_report"] = report_data.get("executive_report", {})
                aggregated["technical_report"] = report_data.get("technical_report", {})
                aggregated["compliance_report"] = report_data.get("compliance_report", {})

        # Fallback for Task 5 if aggregation failed
        if not aggregated["executive_report"]:
            raw = result.raw if hasattr(result, 'raw') else str(result)
            parsed = _extract_json(raw) or {}
            aggregated["executive_report"] = parsed.get("executive_report", {})
            aggregated["technical_report"] = parsed.get("technical_report", {})
            aggregated["compliance_report"] = parsed.get("compliance_report", {})

        return {
            "metadata": {
                "run_id": f"cg-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "indicators_processed": len(raw_indicators),
                "assets_scanned": len(asset_inventory),
            },
            **aggregated,
        }

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    sample_indicators = [
        {"type": "cve", "value": "CVE-2021-44228", "source": "NVD", "confidence": 100},
    ]
    sample_assets = [
        {
            "id": "asset-001",
            "name": "Production Web Server",
            "ip_address": "10.0.1.10",
            "criticality": "CRITICAL",
        },
    ]
    crew_runner = CyberguardThreatIntelligenceIncidentResponseCrew(verbose=True)
    output = crew_runner.run(sample_indicators, sample_assets)
    print(json.dumps(output, indent=2))
