"""
CyberGuard - Task Definitions (detailed IR + reports)
"""

from crewai import Task
from agents import (
    threat_intelligence_agent,
    vulnerability_assessment_agent,
    risk_analysis_agent,
    incident_response_agent,
    reporting_agent,
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

JSON only, no prose.
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
  Cap at 100. Classify: CRITICAL>=70, HIGH>=50, MEDIUM>=30, LOW<30

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
You are an expert Incident Responder. Using the risk register from the previous task,
generate a DETAILED incident response playbook for every CRITICAL and HIGH finding
(risk_score >= 50).

For EACH finding return a JSON object with these exact fields:

{
  "cve_id": "...",
  "asset_id": "...",
  "asset_name": "...",
  "risk_score": 0,
  "severity_label": "...",
  "incident_title": "One-line title describing the incident",
  "incident_summary": "2-3 sentence description of what happened, what is at risk, and why it is urgent",
  "affected_systems": ["list of affected system names"],
  "iocs": [
    {"type": "ip/domain/hash/cve", "value": "...", "description": "what this IoC means"}
  ],
  "playbook": {
    "preparation": [
      {"step": 1, "action": "...", "reasoning": "Why this step is needed", "command": "optional CLI command"}
    ],
    "identification": [
      {"step": 1, "action": "...", "reasoning": "...", "log_source": "where to look"}
    ],
    "containment": [
      {"step": 1, "action": "...", "reasoning": "...", "command": "optional"}
    ],
    "eradication": [
      {"step": 1, "action": "...", "reasoning": "...", "command": "optional"}
    ],
    "recovery": [
      {"step": 1, "action": "...", "reasoning": "...", "verification": "how to confirm success"}
    ],
    "lessons_learned": [
      {"finding": "...", "improvement": "...", "control": "ISO 27001 or NIST control reference"}
    ]
  },
  "mitre_attack_chain": [
    {"tactic": "...", "technique_id": "...", "technique_name": "...", "description": "how attacker used this"}
  ],
  "sla": {
    "response_time": "e.g. 4 hours",
    "resolution_time": "e.g. 24 hours",
    "escalation_contact": "Security Team Lead"
  },
  "compliance_impact": {
    "frameworks": ["ISO 27001", "NIST CSF"],
    "controls_violated": ["A.12.6.1 - Technical vulnerability management"],
    "breach_notification_required": true or false
  }
}

Each phase must have 3-5 specific, actionable steps with real commands where applicable.
Include the REASONING for each step — this is the Explainable AI requirement.
Return a JSON array of these objects, one per finding.
JSON only.
        """,
        agent=incident_response_agent,
        expected_output="JSON array of detailed NIST PICERL playbooks with IoCs, MITRE chain, SLA and compliance impact.",
        context=[task_risk_scoring],
    )

    task_reporting = Task(
        description="""
You are a Security Communications Officer. Using ALL previous task outputs,
generate a comprehensive security report with these exact sections.

Return a single JSON object:
{
  "executive_report": {
    "posture_score": <0-100>,
    "posture_label": "Critical / Poor / Fair / Good",
    "severity_summary": {"critical": N, "high": N, "medium": N, "low": N},
    "top_risk": "One sentence — the single biggest threat right now",
    "action_required": "One sentence — the most important thing to do immediately",
    "business_impact": "2-3 sentences explaining business risk in non-technical language for a CISO",
    "risk_trend": "Increasing / Stable / Decreasing",
    "key_findings": [
      "Finding 1 in plain English",
      "Finding 2 in plain English",
      "Finding 3 in plain English"
    ],
    "recommended_priorities": [
      {"priority": 1, "action": "...", "owner": "Security Team / DevOps / Management", "deadline": "e.g. Immediate / 24h / 1 week"}
    ]
  },
  "technical_report": {
    "total_findings": N,
    "cves_detected": ["CVE-..."],
    "assets_at_risk": ["asset name..."],
    "immediate_patches": [
      {"cve_id": "...", "asset": "...", "patch_command": "e.g. apt-get update && apt-get install ...", "patch_url": "https://..."}
    ],
    "detection_rules": [
      {"rule_name": "...", "description": "SIEM rule to detect this threat", "log_source": "..."}
    ],
    "ioc_summary": [
      {"type": "ip/domain/hash", "value": "...", "threat": "what this indicates"}
    ]
  },
  "compliance_report": {
    "frameworks_assessed": ["ISO 27001", "NIST CSF"],
    "overall_compliance_score": <0-100>,
    "controls_violated": [
      {"control_id": "...", "control_name": "...", "finding": "...", "remediation": "..."}
    ],
    "nist_csf_mapping": {
      "identify": "score 0-100",
      "protect": "score 0-100",
      "detect": "score 0-100",
      "respond": "score 0-100",
      "recover": "score 0-100"
    }
  }
}

Be specific and detailed. Use real CVE IDs, real asset names, real patch commands from the findings.
JSON only.
        """,
        agent=reporting_agent,
        expected_output="JSON object with detailed executive_report, technical_report and compliance_report.",
        context=[task_threat_intel, task_vulnerability, task_risk_scoring, task_incident_response],
    )

    return [
        task_threat_intel,
        task_vulnerability,
        task_risk_scoring,
        task_incident_response,
        task_reporting,
    ]