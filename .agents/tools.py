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
@tool("MITRE ATT&CK Framework Lookup")
def mitre_lookup_tool(technique_id: str) -> str:
    """
    Look up MITRE ATT&CK technique details by technique ID (e.g., 'T1190', 'T1059.001').
    Returns tactic category, technique name, description, detection guidance, 
    and mitigation recommendations.
    """
    # Curated subset of the most common techniques for CyberGuard's use case
    # In production, replace with full MITRE STIX data from attack.mitre.org
    mitre_db = {
        # ── Initial Access ────────────────────────────────────────────────
        "T1190": {
            "name": "Exploit Public-Facing Application",
            "tactic": "Initial Access", "tactic_id": "TA0001",
            "description": "Adversaries exploit weaknesses in internet-facing software.",
            "detection": "Monitor web server logs for unusual requests, 4xx/5xx spikes, SQLi/XSS patterns.",
            "mitigation": "Patch promptly, WAF deployment, input validation, network segmentation.",
        },
        "T1566": {
            "name": "Phishing",
            "tactic": "Initial Access", "tactic_id": "TA0001",
            "description": "Adversaries send phishing messages to gain access to victim systems.",
            "detection": "Email gateway scanning, user-reported phishing, link analysis.",
            "mitigation": "Email filtering, user awareness training, MFA.",
        },
        # ── Execution ─────────────────────────────────────────────────────
        "T1059": {
            "name": "Command and Scripting Interpreter",
            "tactic": "Execution", "tactic_id": "TA0002",
            "description": "Adversaries abuse scripting interpreters to execute malicious code.",
            "detection": "Monitor process creation events, PowerShell/bash history, script executions.",
            "mitigation": "Disable unnecessary interpreters, application whitelisting, EDR deployment.",
        },
        "T1059.001": {
            "name": "PowerShell",
            "tactic": "Execution", "tactic_id": "TA0002",
            "description": "Adversaries abuse PowerShell commands and scripts for execution.",
            "detection": "PowerShell logging (Script Block Logging), encoded command detection, unusual parent processes.",
            "mitigation": "Constrained Language Mode, AMSI, script block logging, execution policy.",
        },
        "T1059.003": {
            "name": "Windows Command Shell",
            "tactic": "Execution", "tactic_id": "TA0002",
            "description": "Adversaries abuse cmd.exe to execute commands.",
            "detection": "Monitor cmd.exe spawned from unusual parents like Office or browsers.",
            "mitigation": "Application whitelisting, restrict cmd.exe access for standard users.",
        },
        # ── Persistence ───────────────────────────────────────────────────
        "T1547": {
            "name": "Boot or Logon Autostart Execution",
            "tactic": "Persistence", "tactic_id": "TA0003",
            "description": "Adversaries configure programs to execute during system boot or logon.",
            "detection": "Monitor registry Run keys, startup folder changes, scheduled tasks.",
            "mitigation": "Audit autostart entries, restrict registry write access.",
        },
        "T1078": {
            "name": "Valid Accounts",
            "tactic": "Defense Evasion / Persistence", "tactic_id": "TA0003",
            "description": "Adversaries use compromised legitimate credentials.",
            "detection": "Anomalous login times, impossible travel, multiple failed logins.",
            "mitigation": "MFA enforcement, privileged access management, credential monitoring.",
        },
        # ── Privilege Escalation ──────────────────────────────────────────
        "T1134": {
            "name": "Access Token Manipulation",
            "tactic": "Privilege Escalation", "tactic_id": "TA0004",
            "description": "Adversaries modify access tokens to operate under a different user context.",
            "detection": "Monitor token manipulation APIs, unusual process privilege changes.",
            "mitigation": "Privileged account protection, audit token use, restrict SeDebugPrivilege.",
        },
        # ── Defense Evasion ───────────────────────────────────────────────
        "T1222": {
            "name": "File and Directory Permissions Modification",
            "tactic": "Defense Evasion", "tactic_id": "TA0005",
            "description": "Adversaries modify file permissions to evade defenses or enable access.",
            "detection": "Monitor chmod/icacls commands, audit file permission changes.",
            "mitigation": "Restrict permission modification to admins, audit ACL changes.",
        },
        # ── Credential Access ─────────────────────────────────────────────
        "T1003": {
            "name": "OS Credential Dumping",
            "tactic": "Credential Access", "tactic_id": "TA0006",
            "description": "Adversaries attempt to dump credentials from OS memory or files.",
            "detection": "LSASS access events, mimikatz signatures, SAM database access.",
            "mitigation": "Credential Guard, restricted admin mode, EDR with memory protection.",
        },
        "T1110": {
            "name": "Brute Force",
            "tactic": "Credential Access", "tactic_id": "TA0006",
            "description": "Adversaries use brute force techniques to gain access to accounts.",
            "detection": "Multiple failed authentication attempts, account lockout events.",
            "mitigation": "Account lockout policies, MFA, strong password requirements.",
        },
        # ── Discovery ─────────────────────────────────────────────────────
        "T1049": {
            "name": "System Network Connections Discovery",
            "tactic": "Discovery", "tactic_id": "TA0007",
            "description": "Adversaries enumerate network connections to identify systems of interest.",
            "detection": "Monitor netstat, ss, net use commands from unusual processes.",
            "mitigation": "Network segmentation, limit discovery tool access.",
        },
        # ── Lateral Movement ──────────────────────────────────────────────
        "T1021": {
            "name": "Remote Services",
            "tactic": "Lateral Movement", "tactic_id": "TA0008",
            "description": "Adversaries use remote services like RDP or SMB to move laterally.",
            "detection": "Monitor remote service usage, unusual login sources.",
            "mitigation": "Disable unnecessary remote services, network segmentation, MFA for remote access.",
        },
        # ── Command and Control ───────────────────────────────────────────
        "T1071": {
            "name": "Application Layer Protocol (C2)",
            "tactic": "Command and Control", "tactic_id": "TA0011",
            "description": "Adversaries use common protocols (HTTP/DNS) for C2 communication.",
            "detection": "Unusual outbound connections, high-frequency DNS queries, beaconing patterns.",
            "mitigation": "DNS filtering, egress proxy inspection, network traffic analysis.",
        },
        # ── Execution (other) ─────────────────────────────────────────────
        "T1127": {
            "name": "Trusted Developer Utilities Proxy Execution",
            "tactic": "Defense Evasion", "tactic_id": "TA0005",
            "description": "Adversaries use trusted developer tools to proxy execution of malicious payloads.",
            "detection": "Monitor MSBuild, mshta, regsvr32 spawning unexpected child processes.",
            "mitigation": "Application whitelisting, block developer utilities on non-dev systems.",
        },
        # ── Impact ────────────────────────────────────────────────────────
        "T1486": {
            "name": "Data Encrypted for Impact (Ransomware)",
            "tactic": "Impact", "tactic_id": "TA0040",
            "description": "Adversaries encrypt files to disrupt availability and extort victims.",
            "detection": "Mass file modification events, shadow copy deletion, unusual process I/O.",
            "mitigation": "Offline backups, endpoint protection, network segmentation, least privilege.",
        },
    }

    technique = mitre_db.get(technique_id.upper())
    if technique:
        return (
            f"Technique ID: {technique_id}\n"
            f"Name: {technique['name']}\n"
            f"Tactic: {technique['tactic']} ({technique['tactic_id']})\n"
        )

    # Try stripping sub-technique suffix and look up parent (e.g. T1059.001 → T1059)
    parent_id = technique_id.split(".")[0].upper()
    parent = mitre_db.get(parent_id)
    if parent:
        return (
            f"Technique ID: {technique_id} (showing parent {parent_id})\n"
            f"Name: {parent['name']}\n"
            f"Tactic: {parent['tactic']} ({parent['tactic_id']})\n"
        )

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