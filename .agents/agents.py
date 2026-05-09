"""
CyberGuard - Multi-Agent Definitions
agents.py — Single model, inter-task delays to avoid rate limits
"""

from crewai import Agent, LLM
from dotenv import load_dotenv
from pathlib import Path
import os
from tools import (
    nvd_search_tool,
    otx_threat_tool,
    asset_lookup_tool,
    mitre_lookup_tool,
    report_formatter_tool,
)

load_dotenv(Path(__file__).parent.parent / ".env.local")

# ─────────────────────────────────────────────
# ONE model for ALL agents.
# llama-3.3-70b-versatile completes tasks in 1-2
# LLM calls vs llama-3.1-8b-instant which needs
# 3-4 retries → burns more TPM overall.
# Free tier: 12,000 TPM, 30 RPM
# ─────────────────────────────────────────────
llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.1,
    max_tokens=800,     # tasks 1-3 are simple JSON, 800 is plenty
)

llm_powerful = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.1,
    max_tokens=2500,    # reduced from 4096 — stays under 12k TPM per call
)


# ─────────────────────────────────────────────
# 1. Threat Intelligence Agent
# ─────────────────────────────────────────────
threat_intelligence_agent = Agent(
    role="Threat Intelligence Analyst",
    goal="Filter, enrich and prioritize threat indicators. Discard confidence < 60. Output JSON.",
    backstory=(
        "Expert SOC analyst. Tags every indicator with MITRE ATT&CK tactic. Concise output only. "
        "IMPORTANT: You only have two tools: otx_threat_intelligence_search and mitre_att_ck_framework_lookup. "
        "Do NOT call any other tool (no brave_search, no web_search). "
        "If mitre_att_ck_framework_lookup returns 'not found', use T1190 as default and move on. "
        "Never search the web."
    ),
    tools=[otx_threat_tool, mitre_lookup_tool],
    llm=llm,
    verbose=True,
    allow_delegation=False,
    max_iter=3,
)

# ─────────────────────────────────────────────
# 2. Vulnerability Assessment Agent
# ─────────────────────────────────────────────
vulnerability_assessment_agent = Agent(
    role="Vulnerability Specialist",
    goal="Match CVEs to asset inventory. Return structured vulnerability-asset mappings. JSON only.",
    backstory=(
        "CPE matching expert. Only reports vulnerabilities with match_confidence >= 70%. "
        "You only have two tools: nvd_cve_search and asset_inventory_lookup. "
        "Do NOT call any other tool. No prose, JSON only."
    ),
    tools=[nvd_search_tool, asset_lookup_tool],
    llm=llm,
    verbose=True,
    allow_delegation=False,
    max_iter=3,
)

# ─────────────────────────────────────────────
# 3. Risk Analysis Agent — no tools, pure computation
# ─────────────────────────────────────────────
risk_analysis_agent = Agent(
    role="Risk Analyst",
    goal="Compute weighted risk scores 0-100. Classify CRITICAL/HIGH/MEDIUM/LOW. JSON only.",
    backstory=(
        "Quantitative risk expert. Applies the exact formula from the task. "
        "No tools needed — compute directly from vulnerability data in context. "
        "Do NOT call any tools. Output JSON only."
    ),
    tools=[],
    llm=llm,
    verbose=True,
    allow_delegation=False,
    max_iter=2,
)

# ─────────────────────────────────────────────
# 4. Incident Response Agent
# ─────────────────────────────────────────────
incident_response_agent = Agent(
    role="Incident Response Lead",
    goal=(
        "Generate DETAILED NIST SP 800-61 PICERL incident response playbooks "
        "for every CRITICAL and HIGH finding. Include IoCs, MITRE ATT&CK chain, "
        "CLI commands, SLA targets, and compliance impact. "
        "3-5 steps per phase with reasoning for each step."
    ),
    backstory=(
        "15-year veteran IR Lead. Follows NIST SP 800-61 and SANS PICERL. "
        "Every step includes WHY it is needed (Explainable AI). "
        "No tools needed. Output detailed JSON only."
    ),
    tools=[],
    llm=llm_powerful,
    verbose=True,
    allow_delegation=False,
    max_iter=3,
)

# ─────────────────────────────────────────────
# 5. Reporting Agent
# ─────────────────────────────────────────────
reporting_agent = Agent(
    role="Security Communications Officer",
    goal=(
        "Produce three distinct reports: executive (CISO-ready), "
        "technical (analyst-ready with patch commands), "
        "and compliance (ISO 27001 + NIST CSF mappings). "
        "Use real CVE IDs, asset names, and patch commands from the findings."
    ),
    backstory=(
        "Dual-skilled: deep technical knowledge AND boardroom communication. "
        "Translates CVSS scores into business risk. "
        "Maps findings to ISO 27001 and NIST CSF controls. "
        "No tools needed. Output complete detailed JSON only."
    ),
    tools=[],
    llm=llm_powerful,
    verbose=True,
    allow_delegation=False,
    max_iter=3,
)