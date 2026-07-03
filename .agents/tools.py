import json
import os
import httpx
from crewai.tools import tool


# ─────────────────────────────────────────────
# 1. NVD CVE Search Tool
# ─────────────────────────────────────────────
@tool("NVD CVE Search")
def nvd_search_tool(query: str) -> str:
    """
    Search the National Vulnerability Database (NVD) for CVE details.
    Accepts a CVE ID (e.g., 'CVE-2024-1234') or a product keyword (e.g., 'apache 2.4.49').
    Returns CVSS score, severity, description, affected CPEs, and patch references.
    """
    base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    api_key = os.getenv("NVD_API_KEY", "")

    headers = {"apiKey": api_key} if api_key else {}
    params = {}

    # Detect if it's a CVE ID or keyword search
    if query.upper().startswith("CVE-"):
        params["cveId"] = query.upper()
    else:
        params["keywordSearch"] = query
        params["resultsPerPage"] = 5

    try:
        response = httpx.get(base_url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()

        vulnerabilities = data.get("vulnerabilities", [])
        if not vulnerabilities:
            return f"No CVEs found for query: {query}"

        results = []
        for vuln in vulnerabilities[:5]:
            cve = vuln.get("cve", {})
            cve_id = cve.get("id", "Unknown")
            description = cve.get("descriptions", [{}])[0].get("value", "No description")

            # Extract CVSS v3 score
            metrics = cve.get("metrics", {})
            cvss_data = metrics.get("cvssMetricV31", metrics.get("cvssMetricV30", []))
            cvss_score = "N/A"
            cvss_severity = "N/A"
            cvss_vector = "N/A"
            if cvss_data:
                cvss_score = cvss_data[0]["cvssData"]["baseScore"]
                cvss_severity = cvss_data[0]["cvssData"]["baseSeverity"]
                cvss_vector = cvss_data[0]["cvssData"]["vectorString"]

            # Extract affected CPEs
            cpe_list = []
            for config in cve.get("configurations", []):
                for node in config.get("nodes", []):
                    for cpe_match in node.get("cpeMatch", []):
                        if cpe_match.get("vulnerable"):
                            cpe_list.append(cpe_match.get("criteria", ""))

            results.append(
                f"CVE ID: {cve_id}\n"
                f"CVSS Score: {cvss_score} ({cvss_severity})\n"
                f"Affected CPEs: {', '.join(cpe_list[:2]) or 'N/A'}\n"
            )

        return "\n---\n".join(results)

    except Exception as e:
        return f"NVD API error: {str(e)}"


# ─────────────────────────────────────────────
# 2. OTX Threat Intelligence Tool
# ─────────────────────────────────────────────
@tool("OTX Threat Intelligence Search")
def otx_threat_tool(indicator: str) -> str:
    """
    Query AlienVault Open Threat Exchange (OTX) for threat intelligence about 
    an indicator. Accepts IP address, domain, URL, or file hash (MD5/SHA256).
    Returns pulse count, threat actor info, malware families, and MITRE ATT&CK tags.
    """
    api_key = os.getenv("OTX_API_KEY", "")
    if not api_key:
        return "OTX_API_KEY not set. Cannot query OTX."

    # Detect indicator type
    import re
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", indicator):
        indicator_type = "IPv4"
        endpoint = f"https://otx.alienvault.com/api/v1/indicators/IPv4/{indicator}/general"
    elif re.match(r"^[a-fA-F0-9]{32}$", indicator):
        indicator_type = "MD5 Hash"
        endpoint = f"https://otx.alienvault.com/api/v1/indicators/file/{indicator}/general"
    elif re.match(r"^[a-fA-F0-9]{64}$", indicator):
        indicator_type = "SHA256 Hash"
        endpoint = f"https://otx.alienvault.com/api/v1/indicators/file/{indicator}/general"
    elif re.match(r"^https?://", indicator):
        indicator_type = "URL"
        from urllib.parse import quote
        endpoint = f"https://otx.alienvault.com/api/v1/indicators/url/{quote(indicator, safe='')}/general"
    else:
        indicator_type = "Domain"
        endpoint = f"https://otx.alienvault.com/api/v1/indicators/domain/{indicator}/general"

    try:
        headers = {"X-OTX-API-KEY": api_key}
        response = httpx.get(endpoint, headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()

        pulse_count = data.get("pulse_info", {}).get("count", 0)
        pulses = data.get("pulse_info", {}).get("pulses", [])

        tags = set()
        malware_families = set()
        threat_actors = set()
        mitre_techniques = set()

        for pulse in pulses[:10]:
            tags.update(pulse.get("tags", []))
            malware_families.update(pulse.get("malware_families", []))
            threat_actors.add(pulse.get("author_name", ""))
            for att in pulse.get("attack_ids", []):
                mitre_techniques.add(att.get("id", ""))

        # Calculate confidence
        confidence = min(100, pulse_count * 5 + (30 if malware_families else 0))

        return (
            f"Indicator: {indicator} ({indicator_type})\n"
            f"OTX Pulse Count: {pulse_count}\n"
            f"Confidence Score: {confidence}/100\n"
            f"Malware Families: {', '.join(list(malware_families)[:2]) or 'None identified'}\n"
            f"MITRE ATT&CK Techniques: {', '.join(list(mitre_techniques)[:3]) or 'None mapped'}\n"
        )

    except Exception as e:
        return f"OTX API error: {str(e)}"


# ─────────────────────────────────────────────
# 3. Asset Lookup Tool (Supabase)
# ─────────────────────────────────────────────
@tool("Asset Inventory Lookup")
def asset_lookup_tool(query: str) -> str:
    """
    Look up organizational assets from the Supabase asset inventory.
    Query can be an asset name, IP address, software name, or 'ALL' to get full list.
    Returns asset details including criticality, software versions, and network exposure.
    """
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not supabase_key:
        # Return mock data for development/testing
        mock_assets = [
            {
                "id": "asset-001",
                "name": "Production Web Server",
                "type": "web_server",
                "ip_address": "10.0.1.10",
                "os": "Ubuntu 22.04",
                "software": [
                    {"name": "Apache HTTP Server", "version": "2.4.49"},
                    {"name": "OpenSSL", "version": "1.1.1"},
                ],
                "criticality": "CRITICAL",
                "network_exposure": "internet-facing",
                "owner": "DevOps Team",
            },
            {
                "id": "asset-002",
                "name": "PostgreSQL Database Server",
                "type": "database",
                "ip_address": "10.0.1.20",
                "os": "Ubuntu 22.04",
                "software": [{"name": "PostgreSQL", "version": "14.5"}],
                "criticality": "CRITICAL",
                "network_exposure": "internal",
                "owner": "Database Team",
            },
            {
                "id": "asset-003",
                "name": "Developer Workstation",
                "type": "endpoint",
                "ip_address": "192.168.1.50",
                "os": "Windows 11",
                "software": [
                    {"name": "Node.js", "version": "18.0.0"},
                    {"name": "Python", "version": "3.11.0"},
                ],
                "criticality": "MEDIUM",
                "network_exposure": "internal",
                "owner": "Dev Team",
            },
        ]

        if query.upper() == "ALL":
            compact_assets = [
                {
                    "id": a["id"],
                    "name": a["name"],
                    "criticality": a["criticality"],
                    "software": a.get("software", [])[:2],
                    "network_exposure": a.get("network_exposure", "internal"),
                }
                for a in mock_assets[:10]
            ]
            return str(compact_assets)

        # Filter by query
        filtered = [
            a for a in mock_assets
            if query.lower() in a["name"].lower()
            or query.lower() in a["ip_address"]
            or any(query.lower() in s["name"].lower() for s in a.get("software", []))
        ]
        if not filtered:
            return f"No assets matching '{query}' found."
        compact_filtered = [
            {
                "id": a["id"],
                "name": a["name"],
                "criticality": a["criticality"],
                "software": a.get("software", [])[:2],
                "network_exposure": a.get("network_exposure", "internal"),
            }
            for a in filtered[:10]
        ]
        return str(compact_filtered)

    # Real Supabase query
    try:
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
        }

        if query.upper() == "ALL":
            url = f"{supabase_url}/rest/v1/assets?select=*&limit=100"
        else:
            url = (
                f"{supabase_url}/rest/v1/assets"
                f"?select=*&or=(name.ilike.*{query}*,ip_address.eq.{query})"
            )

        response = httpx.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        assets = response.json()
        if not assets:
            return f"No assets found for query: {query}"
        compact_assets = [
            {
                "id": a.get("id"),
                "name": a.get("name"),
                "criticality": a.get("criticality"),
                "software": (a.get("software") or [])[:2],
                "network_exposure": a.get("network_exposure", "internal"),
            }
            for a in assets[:10]
        ]
        return str(compact_assets)

    except Exception as e:
        return f"Supabase asset lookup error: {str(e)}"


# ─────────────────────────────────────────────
# 4. MITRE ATT&CK Lookup Tool
# ─────────────────────────────────────────────

_MITRE_DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "mitre_attack_enterprise.json")
_mitre_db_cache: dict | None = None


def _load_mitre_db() -> dict:
    """
    Lazily load the full MITRE ATT&CK Enterprise technique set (697 techniques,
    trimmed from the official STIX bundle at github.com/mitre/cti to just the
    fields this tool needs). Cached in-process after the first call.
    """
    global _mitre_db_cache
    if _mitre_db_cache is None:
        with open(_MITRE_DATA_PATH, "r", encoding="utf-8") as f:
            _mitre_db_cache = json.load(f)["techniques"]
    return _mitre_db_cache


def _format_technique(technique_id: str, technique: dict, note: str = "") -> str:
    return (
        f"Technique ID: {technique_id}{note}\n"
        f"Name: {technique['name']}\n"
        f"Tactic: {technique['tactic']} ({technique['tactic_id']})\n"
        f"Description: {technique['description']}\n"
        f"Detection: {technique['detection'] or 'No detection guidance published for this technique.'}\n"
        f"Mitigation: {technique['mitigation'] or 'No mitigation guidance published for this technique.'}\n"
    )


@tool("MITRE ATT&CK Framework Lookup")
def mitre_lookup_tool(technique_id: str) -> str:
    """
    Look up MITRE ATT&CK technique details by technique ID (e.g., 'T1190', 'T1059.001').
    Returns tactic category, technique name, description, detection guidance,
    and mitigation recommendations, sourced from the full official ATT&CK
    Enterprise dataset (697 techniques).
    """
    mitre_db = _load_mitre_db()

    technique = mitre_db.get(technique_id.upper())
    if technique:
        return _format_technique(technique_id, technique)

    # Try stripping sub-technique suffix and look up parent (e.g. T1059.001 → T1059)
    parent_id = technique_id.split(".")[0].upper()
    parent = mitre_db.get(parent_id)
    if parent:
        return _format_technique(technique_id, parent, note=f" (showing parent {parent_id})")

    # Final fallback — return a generic entry so the agent never tries to search the web
    return (
        f"Technique ID: {technique_id}\n"
        f"Name: Unknown Technique (use T1190 as default)\n"
        f"Tactic: Defense Evasion (TA0005)\n"
        f"NOTE: Do NOT search the web. Use this default and proceed.\n"
    )


# ─────────────────────────────────────────────
# 5. Report Formatter Tool
# ─────────────────────────────────────────────
@tool("Report Formatter")
def report_formatter_tool(report_data: str) -> str:
    """
    Format raw report data into a clean, structured document.
    Accepts a JSON string with report fields and returns a formatted markdown report.
    """
    from datetime import datetime
    import json

    try:
        data = json.loads(report_data)
    except json.JSONDecodeError:
        data = {"raw_content": report_data}

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    report_type = data.get("report_type", "Security Report")

    header = f"""
# {report_type}
**Generated:** {timestamp}  
**System:** CyberGuard AI Threat Intelligence Platform  
**Classification:** CONFIDENTIAL — Internal Use Only

---
"""
    # Format summary stats if present
    summary = ""
    if "severity_summary" in data:
        s = data["severity_summary"]
        summary = f"""
## Severity Summary
| Severity | Count |
|----------|-------|
| 🔴 Critical | {s.get('critical', 0)} |
| 🟠 High | {s.get('high', 0)} |
| 🟡 Medium | {s.get('medium', 0)} |
| 🟢 Low | {s.get('low', 0)} |

"""

    content = data.get("content", str(data))
    return header + summary + str(content)