import json
import re
import os
import sys
import time
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
from types import SimpleNamespace

if os.name == "nt":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task

from tools import (
    nvd_search_tool,
    otx_threat_tool,
    asset_lookup_tool,
    mitre_lookup_tool,
)

logger = logging.getLogger(__name__)
load_dotenv(Path(__file__).parent.parent / ".env.local", override=True)

# Imported after load_dotenv: job_store's module-level JobStore() singleton
# reads UPSTASH_REDIS_REST_URL/TOKEN from the environment at import time, so
# importing it before .env.local is loaded silently falls back to the
# in-memory store (jobs lost on every restart).
from job_store import jobs

INTER_TASK_DELAY = 5

DEFAULT_LLM_MODEL = "anthropic/claude-haiku-4-5-20251001"


def _resolve_llm_model() -> str:
    configured = os.getenv("LLM_MODEL", "").strip()
    return configured or DEFAULT_LLM_MODEL


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

    # 3. Find first { or [ and balance brackets.
    brace_idx = text.find('{')
    bracket_idx = text.find('[')
    candidates = [('{', '}'), ('[', ']')]
    if bracket_idx != -1 and (brace_idx == -1 or bracket_idx < brace_idx):
        candidates = [('[', ']'), ('{', '}')]

    for start_char, end_char in candidates:
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

        llm_model = _resolve_llm_model()
        logger.info("[CyberGuard] LLM model: %s", llm_model)

        self.llm = LLM(
            model=llm_model,
            temperature=0.1,
            max_tokens=4096,
        )
        
        self.llm_powerful = LLM(
            model=llm_model,
            temperature=0.1,
            max_tokens=32000,
        )

        # Token-usage checkpoint for task_callback delta logging (see run()).
        self._usage_checkpoint = 0

        self._current_job_id = None
        self._task_index = 0

    @agent
    def threat_intelligence_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config["threat_intelligence_analyst"],
            tools=[otx_threat_tool, mitre_lookup_tool, nvd_search_tool],
            allow_delegation=False,
            max_iter=15,
            llm=self.llm,
        )

    @agent
    def vulnerability_assessment_specialist(self) -> Agent:
        return Agent(
            config=self.agents_config["vulnerability_assessment_specialist"],
            tools=[nvd_search_tool, asset_lookup_tool],
            allow_delegation=False,
            max_iter=15,
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
            max_rpm=20,
            task_callback=self.task_callback,
        )

    def _usage_totals(self):
        """Sums token usage across both LLM instances (see __init__)."""
        a = self.llm.get_token_usage_summary()
        b = self.llm_powerful.get_token_usage_summary()
        return SimpleNamespace(
            total_tokens=a.total_tokens + b.total_tokens,
            prompt_tokens=a.prompt_tokens + b.prompt_tokens,
            completion_tokens=a.completion_tokens + b.completion_tokens,
            successful_requests=a.successful_requests + b.successful_requests,
        )

    def task_callback(self, task_output) -> None:
        """Logs per-task token usage, records progress for the job poller, and
        gives requests a small, even pace."""
        usage = self._usage_totals()
        task_tokens = usage.total_tokens - self._usage_checkpoint
        self._usage_checkpoint = usage.total_tokens

        self._task_index += 1
        if self._current_job_id:
            jobs.update(self._current_job_id, current_step=self._task_index)

        task_name = getattr(task_output, "name", None) or getattr(task_output, "description", "")[:60]
        logger.info(
            f"[CyberGuard] Task '{task_name}' completed ({self._task_index}/5) — "
            f"{task_tokens} tokens (prompt={usage.prompt_tokens}, completion={usage.completion_tokens}), "
            f"run total so far: {usage.total_tokens}. Waiting {INTER_TASK_DELAY}s..."
        )
        time.sleep(INTER_TASK_DELAY)

    def run(self, raw_indicators: list[dict], asset_inventory: list[dict], job_id: str | None = None) -> dict:
        """
        Custom wrapper for FastAPI to bridge JSON inputs to the YAML template inputs.
        """
        self._current_job_id = job_id
        self._task_index = 0

        now = datetime.now(timezone.utc).isoformat()
        logger.info(f"[CyberGuard] Starting pipeline at {now}")
        logger.info(f"[CyberGuard] {len(raw_indicators)} indicators | {len(asset_inventory)} assets")

        inputs = {
            'target_organization': 'CyberGuard Platform',
            'threat_indicators': json.dumps(raw_indicators),
            'asset_inventory': json.dumps(asset_inventory)
        }

        run_start_usage = self._usage_totals()
        self._usage_checkpoint = run_start_usage.total_tokens

        max_retries = 4
        result = None
        for attempt in range(max_retries):
            try:
                self._task_index = 0
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
                is_rate_limit = (
                    ("rate_limit" in err or "429" in err or "ratelimit" in err)
                    and "tool_use_failed" not in err
                    and "badrequest" not in err
                )
                if is_rate_limit and attempt < max_retries - 1:
                    logger.warning(f"[CyberGuard] Rate limit hit on attempt {attempt + 1}: {e}")
                    continue
                if is_rate_limit:
                    logger.error(f"[CyberGuard] Rate limit persisted after {max_retries} attempts, giving up: {e}")
                    break
                raise

        final_usage = self._usage_totals()
        run_usage = {
            "total_tokens": final_usage.total_tokens - run_start_usage.total_tokens,
            "prompt_tokens": final_usage.prompt_tokens - run_start_usage.prompt_tokens,
            "completion_tokens": final_usage.completion_tokens - run_start_usage.completion_tokens,
            "successful_requests": final_usage.successful_requests - run_start_usage.successful_requests,
        }
        logger.info(
            f"[CyberGuard] Run token usage: {run_usage['total_tokens']} total "
            f"(prompt={run_usage['prompt_tokens']}, completion={run_usage['completion_tokens']}, "
            f"requests={run_usage['successful_requests']})"
        )

        if result is None:
            return {"error": "Pipeline failed after maximum retries", "token_usage": run_usage}

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
        
        if hasattr(result, 'tasks_output'):
            tasks = result.tasks_output

            if len(tasks) > 0:
                aggregated["threats"] = _extract_json(tasks[0].raw) or []

            if len(tasks) > 2:
                aggregated["risk_register"] = _extract_json(tasks[2].raw) or []

            if len(tasks) > 3:
                aggregated["playbooks"] = _extract_json(tasks[3].raw) or []

            if len(tasks) > 4:
                report_data = _extract_json(tasks[4].raw)
                if not isinstance(report_data, dict):
                    report_data = {}
                aggregated["executive_report"] = report_data.get("executive_report", {})
                aggregated["technical_report"] = report_data.get("technical_report", {})
                aggregated["compliance_report"] = report_data.get("compliance_report", {})

        # Fallback for Task 5 if aggregation failed
        if not aggregated["executive_report"]:
            raw = result.raw if hasattr(result, 'raw') else str(result)
            parsed = _extract_json(raw)
            if not isinstance(parsed, dict):
                parsed = {}
            aggregated["executive_report"] = parsed.get("executive_report", {})
            aggregated["technical_report"] = parsed.get("technical_report", {})
            aggregated["compliance_report"] = parsed.get("compliance_report", {})

        return {
            "metadata": {
                "run_id": f"cg-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
                "processed_at": datetime.now(timezone.utc).isoformat(),
                "indicators_processed": len(raw_indicators),
                "assets_scanned": len(asset_inventory),
                "token_usage": run_usage,
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
