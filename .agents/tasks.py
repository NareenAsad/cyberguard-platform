from crewai import Task
from agents import (
    threat_intelligence_agent,
    vulnerability_assessment_agent,
    risk_analysis_agent,
    incident_response_agent,
)


def create_tasks(raw_indicators: list[dict], asset_inventory: list[dict]) -> list[Task]:

    task_threat_intel = Task(
        description=f"""
Process these {len(raw_indicators)} threat indicators:
{raw_indicators}

Steps:
1. Discard confidence < 60
2. For each surviving indicator: call OTX tool, then MITRE tool for tactic
3. Return JSON array with fields:
   indicator_value, indicator_type, confidence_score, mitre_tactic,
   mitre_technique_id, active_exploitation (bool), priority_score (0-100)

Be concise. JSON only, no prose.
        """,
        agent=threat_intelligence_agent,
        expected_output="JSON array of enriched indicators.",
    )

    task_vulnerability = Task(
        description=f"""
Using enriched indicators from previous task and this asset inventory:
{asset_inventory}

Steps:
1. For any CVE indicator, call NVD tool to get CVSS score
2. Check if any asset runs the affected software version
3. Only include matches with confidence >= 70%

Return JSON array with fields:
asset_id, asset_name, asset_criticality, cve_id, cvss_base_score,
patch_available (bool), match_confidence, affected_component

JSON only, no prose.
        """,
        agent=vulnerability_assessment_agent,
        expected_output="JSON array of vulnerability-asset mappings.",
        context=[task_threat_intel],
    )

    task_risk_scoring = Task(
        description="""
Using the vulnerability mappings from the previous task, compute risk scores.

Formula (apply exactly):
  S_v = cvss_base_score (0-10)
  E_x = 10 if public exploit known, 6 if PoC, 2 if theoretical
  A_c = CRITICAL=10, HIGH=7, MEDIUM=5, LOW=2
  T_i = 10 if active_exploitation=true, 6 if targeted, 2 if generic
  Risk = ((0.30×S_v) + (0.25×E_x) + (0.25×A_c) + (0.20×T_i)) × 10
  Cap at 100. Classify: CRITICAL≥70, HIGH≥50, MEDIUM≥30, LOW<30

Return JSON array sorted by risk_score desc with fields:
asset_id, asset_name, cve_id, risk_score, severity_label,
cvss_score, exploitability_score, asset_criticality_score,
threat_intel_score, mitre_tactic, patch_available

JSON only.
        """,
        agent=risk_analysis_agent,
        expected_output="JSON array of risk scores sorted descending.",
        context=[task_vulnerability],
    )

    task_incident_response = Task(
        description="""
For CRITICAL findings only from the risk register, generate a brief playbook.

Each playbook must have these phases (2-3 bullet points each):
- containment: immediate isolation steps
- eradication: patch/remove root cause
- recovery: restore and verify

Return JSON array with fields:
cve_id, asset_id, risk_score, playbook: {containment, eradication, recovery}

JSON only. Be brief.
        """,
        agent=incident_response_agent,
        expected_output="JSON array of playbooks for CRITICAL findings.",
        context=[task_risk_scoring],
    )

    return [
        task_threat_intel,
        task_vulnerability,
        task_risk_scoring,
        task_incident_response,
    ]