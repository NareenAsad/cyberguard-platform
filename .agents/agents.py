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
# Force CrewAI/LiteLLM defaults to the same stronger model in case any
# internal call path ignores per-agent LLM config.
os.environ["MODEL"] = "groq/llama-3.3-70b-versatile"
os.environ["LITELLM_MODEL"] = "groq/llama-3.3-70b-versatile"
os.environ["GROQ_MODEL"] = "llama-3.3-70b-versatile"

# ─────────────────────────────────────────────
# LLM — stronger model for reliable tool calling
# ─────────────────────────────────────────────
llm = LLM(
    model="groq/llama-3.3-70b-versatile",  # stronger model, handles tool calls
    temperature=0.1,
    max_tokens=1024,
)


# ─────────────────────────────────────────────
# 1. Threat Intelligence Agent
# ─────────────────────────────────────────────
threat_intelligence_agent = Agent(
    role="Threat Intelligence Analyst",
    goal="Filter, enrich and prioritize threat indicators. Discard confidence < 60. Output JSON.",
    backstory=(
        "Expert SOC analyst. Tags every indicator with MITRE ATT&CK tactic. Concise output only. "
        "IMPORTANT: You only have two tools available: otx_threat_intelligence_search and mitre_att_ck_framework_lookup. "
        "Do NOT attempt to call any other tool (no brave_search, no web_search, no internet search). "
        "If mitre_att_ck_framework_lookup returns 'not found', use T1190 as the default technique and move on. "
        "Never search the web. Only use the two tools provided."
    ),
    tools=[otx_threat_tool, mitre_lookup_tool],
    llm=llm,
    function_calling_llm=llm,
    verbose=False,
    allow_delegation=False,
    max_iter=1,
)

# ─────────────────────────────────────────────
# 2. Vulnerability Assessment Agent
# ─────────────────────────────────────────────
vulnerability_assessment_agent = Agent(
    role="Vulnerability Specialist",
    goal="Match CVEs to asset inventory. Return asset_id, cve_id, cvss_score, patch_available, match_confidence. JSON only.",
    backstory="CPE matching expert. Only reports vulnerabilities with match_confidence >= 70%. No prose.",
    tools=[nvd_search_tool, asset_lookup_tool],
    llm=llm,
    function_calling_llm=llm,
    verbose=False,
    allow_delegation=False,
    max_iter=1,
)

# ─────────────────────────────────────────────
# 3. Risk Analysis Agent
# ─────────────────────────────────────────────
risk_analysis_agent = Agent(
    role="Risk Analyst",
    goal="Compute risk scores using: Risk=(0.30×CVSS)+(0.25×Exploit)+(0.25×AssetCrit)+(0.20×ThreatIntel)×10. Classify CRITICAL/HIGH/MEDIUM/LOW. JSON only.",
    backstory="Quantitative risk expert. Always uses the exact formula. No tool calls needed — compute directly from context.",
    tools=[],          # no tools = zero extra token overhead
    llm=llm,
    function_calling_llm=llm,
    verbose=False,
    allow_delegation=False,
    max_iter=1,        # pure computation, one pass to reduce TPM pressure
)

# ─────────────────────────────────────────────
# 4. Incident Response Agent
# ─────────────────────────────────────────────
incident_response_agent = Agent(
    role="Incident Response Lead",
    goal="Generate concise NIST PICERL playbooks for CRITICAL findings only. 3-5 bullet points per phase. JSON only.",
    backstory="IR expert following NIST SP 800-61. Writes actionable, brief steps. No lengthy prose.",
    tools=[],          # no tools needed — IR knowledge is in the model
    llm=llm,
    function_calling_llm=llm,
    verbose=False,
    allow_delegation=False,
    max_iter=1,
)

# ─────────────────────────────────────────────
# 5. Reporting Agent
# ─────────────────────────────────────────────
reporting_agent = Agent(
    role="Security Reporter",
    goal="Summarize findings into a short executive_report and technical_report. JSON only. Max 200 words total.",
    backstory="Writes clear, brief security reports for CISOs and analysts. Prioritizes brevity.",
    tools=[],
    llm=llm,
    function_calling_llm=llm,
    verbose=False,
    allow_delegation=False,
    max_iter=1,
)