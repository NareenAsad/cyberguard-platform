# risk_engine_py.py

# Risk Score Weights (must sum to 1.0)
RISK_WEIGHTS = {
    "cvss": 0.30,             # CVSS Base Score weight (technical severity)
    "exploitability": 0.25,   # Exploit availability weight
    "assetCriticality": 0.25, # Business importance of the asset
    "threatIntel": 0.20,      # Active threat context weight
}

# Severity Classification Thresholds
SEVERITY_THRESHOLDS = {
    "CRITICAL": 70,   # Score 70–100: Immediate response, auto-alert, auto-playbook
    "HIGH": 50,       # Score 50–69: Fix within 24 hours
    "MEDIUM": 30,     # Score 30–49: Fix within current sprint (2 weeks)
    "LOW": 0,         # Score  0–29: Next maintenance window
}

# Asset Criticality Numeric Values (0–10 scale)
ASSET_CRITICALITY_MAP = {
    "CRITICAL": 10,
    "HIGH": 7,
    "MEDIUM": 5,
    "LOW": 2,
}

EXPLOIT_MAP = {
    "PUBLIC": 10,      # Active exploit in Metasploit / ExploitDB
    "POC_ONLY": 6,     # Proof-of-concept code published
    "THEORETICAL": 2,  # No public exploit, theoretical possibility
    "NONE": 0,
}

def classify_severity(score: int) -> str:
    if score >= SEVERITY_THRESHOLDS["CRITICAL"]:
        return "CRITICAL"
    if score >= SEVERITY_THRESHOLDS["HIGH"]:
        return "HIGH"
    if score >= SEVERITY_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    return "LOW"

def calculate_risk_score_py(payload: dict) -> dict:
    """
    Calculate weighted risk score based on the CyberGuard risk engine formula.
    Expected keys in payload:
    - cvss_score (or cvssBaseScore): float
    - exploit_availability: str ('PUBLIC', 'POC_ONLY', 'THEORETICAL', 'NONE')
    - asset_criticality: str ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
    - active_exploitation: bool
    - targeted_campaign: bool (optional)
    - network_exposure: str ('internet-facing', 'internal', 'air-gapped')
    """
    # ── S_v: CVSS Base Score (already 0–10) ──
    raw_cvss = payload.get("cvss_score") or payload.get("cvssBaseScore") or 0.0
    sv = min(10.0, max(0.0, float(raw_cvss)))

    # ── E_x: Exploitability Score (0–10) ──
    exploit_availability = str(payload.get("exploit_availability", "NONE")).upper()
    ex = EXPLOIT_MAP.get(exploit_availability, 0)

    # ── A_c: Asset Criticality Score (0–10) ──
    asset_criticality = str(payload.get("asset_criticality", "MEDIUM")).upper()
    ac = ASSET_CRITICALITY_MAP.get(asset_criticality, 5)

    # ── T_i: Threat Intel Context Score (0–10) ──
    ti = 2 # baseline: generic threat
    if payload.get("targeted_campaign"):
        ti = 6
    if payload.get("active_exploitation"):
        ti = 10

    # ── Network Exposure Modifier ──
    network_exposure = str(payload.get("network_exposure", "internal")).lower()
    if network_exposure == "internet-facing":
        exposure_multiplier = 1.15
    elif network_exposure == "internal":
        exposure_multiplier = 1.0
    else: # air-gapped
        exposure_multiplier = 0.7

    # ── Weighted Formula ──
    raw_score = (
        (RISK_WEIGHTS["cvss"] * sv) +
        (RISK_WEIGHTS["exploitability"] * ex) +
        (RISK_WEIGHTS["assetCriticality"] * ac) +
        (RISK_WEIGHTS["threatIntel"] * ti)
    )

    # Normalize to 0–100 and apply exposure multiplier
    normalized_score = min(100, round(raw_score * 10 * exposure_multiplier))

    # ── Severity Label ──
    severity_label = classify_severity(normalized_score)

    return {
        "cvssScore": sv,
        "exploitabilityScore": ex,
        "assetCriticalityScore": ac,
        "threatIntelScore": ti,
        "riskScore": normalized_score,
        "severityLabel": severity_label,
        "networkExposure": network_exposure
    }
