from crewai import Task
from agents import (
    threat_intelligence_agent,
    vulnerability_assessment_agent,
    risk_analysis_agent,
    incident_response_agent,
    reporting_agent,
)


def create_tasks(raw_indicators: list[dict], asset_inventory: list[dict]) -> list[Task]:
    """
    Build and return the ordered task pipeline.
    
    Args:
        raw_indicators: Fresh IoCs pulled from OTX / ThreatFox / URLhaus
        asset_inventory: Organization's assets from Supabase
    
    Returns:
        Ordered list of CrewAI Tasks
    """

    # ─── TASK 1: Threat Intelligence Filtering & Enrichment ───────────────
    task_threat_intel = Task(
        description=f"""
        You have received {len(raw_indicators)} raw threat indicators from the 
        data collection layer. Perform the following steps:

        1. FILTER: Remove any indicator with confidence < 60.
        2. DEDUPLICATE: Collapse duplicate IPs, domains, hashes into single records.
        3. ENRICH: For each surviving indicator, add:
           - Geolocation (country, ASN)
           - Threat actor attribution if known
           - Associated MITRE ATT&CK tactic and technique ID
           - First-seen / last-seen timestamps
        4. CORRELATE: Group related indicators into named campaigns where possible.
        5. PRIORITIZE: Score each indicator 0-100 based on:
           - Source reliability (NVD > ThreatFox > Community feed)
           - Recency (last 24h = +20 pts)
           - Active exploitation evidence (+30 pts)

        Raw indicators to process:
        {raw_indicators}

        Output a structured JSON list of enriched, high-confidence indicators.
        """,
        agent=threat_intelligence_agent,
        expected_output=(
            "A JSON array of enriched threat indicators. Each object must contain: "
            "indicator_value, indicator_type, confidence_score (0-100), "
            "mitre_tactic, mitre_technique_id, threat_actor (or 'Unknown'), "
            "campaign_name (or null), active_exploitation (bool), priority_score (0-100)."
        ),
    )

    # ─── TASK 2: Vulnerability Assessment ─────────────────────────────────
    task_vulnerability = Task(
        description=f"""
        Using the enriched threat indicators from the previous task AND the 
        organization's asset inventory below, perform vulnerability assessment:

        1. QUERY NVD: For each enriched indicator related to CVEs or software 
           vulnerabilities, fetch full CVE details (CVSS v3 score, vector string,
           affected CPE versions, patch availability).
        
        2. CROSS-REFERENCE: For each CVE found, check if any asset in the 
           inventory matches the affected product + version range using CPE matching.
        
        3. DEPENDENCY CHECK: For application assets, also check if any vulnerable 
           library versions appear in their dependency stack.
        
        4. OUTPUT MAPPINGS: Produce a list of (asset_id, cve_id, cvss_score, 
           patch_available, match_confidence) tuples.

        Asset Inventory:
        {asset_inventory}

        Only report vulnerabilities with match_confidence >= 70%.
        """,
        agent=vulnerability_assessment_agent,
        expected_output=(
            "A JSON array of vulnerability-asset mappings. Each object must contain: "
            "asset_id, asset_name, asset_type, asset_criticality, cve_id, "
            "cvss_base_score, cvss_vector, patch_available (bool), "
            "patch_url (or null), match_confidence (0-100), affected_component."
        ),
        context=[task_threat_intel],  # receives enriched indicators as context
    )

    # ─── TASK 3: Risk Scoring ──────────────────────────────────────────────
    task_risk_scoring = Task(
        description="""
        Using the vulnerability-asset mappings from the previous task, calculate 
        a final risk score for each finding using this EXACT weighted formula:

        Risk Score = (W_s × S_v) + (W_e × E_x) + (W_a × A_c) + (W_t × T_i)

        Where:
        - S_v = CVSS Base Score, normalized to 0-10 scale  (Weight W_s = 0.30)
        - E_x = Exploitability: 10 if public exploit exists, 6 if PoC only, 2 if theoretical
                                (Weight W_e = 0.25)
        - A_c = Asset Criticality: Critical=10, High=7, Medium=5, Low=2
                                   (Weight W_a = 0.25)
        - T_i = Threat Intel Context: 10 if active exploitation confirmed, 
                6 if targeted campaign, 2 if generic threat  (Weight W_t = 0.20)

        NORMALIZE final score to 0-100 by multiplying by 10.

        CLASSIFY findings:
        - CRITICAL (70-100): Immediate response required — auto-trigger playbook
        - HIGH (50-69): Fix within 24 hours
        - MEDIUM (30-49): Fix within sprint (2 weeks)
        - LOW (0-29): Track and fix in next maintenance window

        Also map each finding to its MITRE ATT&CK tactic.
        """,
        agent=risk_analysis_agent,
        expected_output=(
            "A JSON array sorted by risk_score descending. Each object: "
            "asset_id, asset_name, cve_id, risk_score (0-100), severity_label "
            "(CRITICAL/HIGH/MEDIUM/LOW), cvss_score, exploitability_score, "
            "asset_criticality_score, threat_intel_score, mitre_tactic, "
            "mitre_technique_id, recommended_priority."
        ),
        context=[task_vulnerability],
    )

    # ─── TASK 4: Incident Response Playbook Generation ────────────────────
    task_incident_response = Task(
        description="""
        For EVERY finding classified as CRITICAL or HIGH in the risk register, 
        generate a complete incident response playbook following NIST SP 800-61 
        PICERL framework:

        For each finding, produce:

        1. PREPARATION
           - Required tools and access levels
           - Team roles and escalation contacts

        2. IDENTIFICATION / INVESTIGATION
           - Specific log sources to query (with example log patterns)
           - Indicators of Compromise (IoCs) to hunt for
           - Commands to run for evidence collection
           - How to confirm exploitation vs. false positive

        3. CONTAINMENT
           - Immediate containment steps (e.g., isolate VM, block IP at firewall)
           - Short-term containment (network segmentation, credential rotation)
           - How to preserve forensic evidence during containment

        4. ERADICATION
           - Remove malicious artifacts
           - Patch the vulnerability with specific patch/version to apply
           - Validate removal with verification commands

        5. RECOVERY
           - Service restoration sequence
           - Health checks to confirm clean state
           - Monitoring rules to add post-recovery

        6. LESSONS LEARNED
           - Root cause summary
           - Process improvements to prevent recurrence
           - Detection rule to add to SIEM

        IMPORTANT: For each step, include a one-sentence REASONING explaining 
        WHY this step is necessary (this fulfills the Explainable AI requirement).
        """,
        agent=incident_response_agent,
        expected_output=(
            "A JSON array of playbooks, one per CRITICAL/HIGH finding. Each object: "
            "cve_id, asset_id, risk_score, playbook: { preparation, identification, "
            "containment, eradication, recovery, lessons_learned }. Each phase is "
            "an array of { step, action, reasoning, command (optional) }."
        ),
        context=[task_risk_scoring],
    )

    # ─── TASK 5: Report Generation ─────────────────────────────────────────
    task_reporting = Task(
        description="""
        Using all previous task outputs (threat intel, vulnerability mappings, 
        risk scores, and playbooks), generate three distinct reports:

        REPORT 1 — EXECUTIVE SUMMARY (for CISO/Management)
        - Overall security posture score (0-100)
        - Count of findings by severity
        - Top 3 most critical risks in plain English (no CVE jargon)
        - Business impact for each critical risk (data breach? downtime? compliance?)
        - Resource requirements: estimated remediation hours and cost
        - Trend comparison: better or worse than last week?
        - One-paragraph "What should the board know?" summary

        REPORT 2 — TECHNICAL REPORT (for Security Analysts)
        - Full risk register table sorted by priority
        - Complete IoC list (IPs, domains, hashes) for SIEM ingestion
        - Vulnerability details with CVE links and patch commands
        - Playbook references by finding ID
        - Timeline of threat activity

        REPORT 3 — COMPLIANCE REPORT
        - Map each critical finding to ISO 27001 controls
        - Map to NIST CSF categories (Identify/Protect/Detect/Respond/Recover)
        - Remediation status tracking
        - Audit-ready evidence log

        Each report must have: report_type, generated_at (ISO timestamp), 
        severity_summary, and full content sections.
        """,
        agent=reporting_agent,
        expected_output=(
            "A JSON object with three keys: executive_report, technical_report, "
            "compliance_report. Each is a fully structured report object with "
            "metadata and content sections as described."
        ),
        context=[task_threat_intel, task_vulnerability, task_risk_scoring, task_incident_response],
    )

    return [
        task_threat_intel,
        task_vulnerability,
        task_risk_scoring,
        task_incident_response,
        task_reporting,
    ]