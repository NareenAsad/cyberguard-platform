"""
Tests for tools.py — the CrewAI tools that call external threat-intel APIs
(NVD, OTX) plus the local MITRE ATT&CK and asset-lookup helpers.

External HTTP calls are mocked with respx so the suite runs offline/in CI
without real NVD_API_KEY / OTX_API_KEY credentials.
"""

import httpx
import pytest
import respx

from tools import nvd_search_tool, otx_threat_tool, mitre_lookup_tool, asset_lookup_tool


# ── NVD CVE Search ──────────────────────────────────────────────────────────

@respx.mock
def test_nvd_search_returns_cvss_details_for_known_cve():
    respx.get("https://services.nvd.nist.gov/rest/json/cves/2.0").mock(
        return_value=httpx.Response(200, json={
            "vulnerabilities": [{
                "cve": {
                    "id": "CVE-2021-44228",
                    "descriptions": [{"value": "Apache Log4j2 JNDI RCE"}],
                    "metrics": {
                        "cvssMetricV31": [{"cvssData": {
                            "baseScore": 10.0, "baseSeverity": "CRITICAL",
                            "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
                        }}]
                    },
                    "configurations": [],
                }
            }]
        })
    )
    result = nvd_search_tool.func("CVE-2021-44228")
    assert "CVE-2021-44228" in result
    assert "10.0" in result
    assert "CRITICAL" in result


@respx.mock
def test_nvd_search_handles_no_results():
    respx.get("https://services.nvd.nist.gov/rest/json/cves/2.0").mock(
        return_value=httpx.Response(200, json={"vulnerabilities": []})
    )
    result = nvd_search_tool.func("CVE-9999-00000")
    assert "No CVEs found" in result


@respx.mock
def test_nvd_search_handles_api_error_gracefully():
    respx.get("https://services.nvd.nist.gov/rest/json/cves/2.0").mock(
        return_value=httpx.Response(503)
    )
    result = nvd_search_tool.func("CVE-2021-44228")
    assert "NVD API error" in result


# ── OTX Threat Intelligence ─────────────────────────────────────────────────

@respx.mock
def test_otx_lookup_ip_indicator(monkeypatch):
    monkeypatch.setenv("OTX_API_KEY", "fake-key-for-test")
    respx.get("https://otx.alienvault.com/api/v1/indicators/IPv4/1.2.3.4/general").mock(
        return_value=httpx.Response(200, json={
            "pulse_info": {
                "count": 3,
                "pulses": [{"tags": ["botnet"], "malware_families": ["Emotet"],
                            "author_name": "researcher1", "attack_ids": [{"id": "T1071"}]}],
            }
        })
    )
    result = otx_threat_tool.func("1.2.3.4")
    assert "IPv4" in result
    assert "Emotet" in result
    assert "T1071" in result


def test_otx_lookup_without_api_key_returns_explicit_message(monkeypatch):
    monkeypatch.delenv("OTX_API_KEY", raising=False)
    result = otx_threat_tool.func("1.2.3.4")
    assert "OTX_API_KEY not set" in result


# ── MITRE ATT&CK Lookup ─────────────────────────────────────────────────────

def test_mitre_lookup_known_technique():
    result = mitre_lookup_tool.func("T1190")
    assert "Exploit Public-Facing Application" in result
    assert "Initial Access" in result
    assert "Detection:" in result
    assert "Mitigation:" in result


def test_mitre_lookup_subtechnique_falls_back_to_parent_when_unlisted():
    # T1059.999 doesn't exist; should fall back to parent T1059.
    result = mitre_lookup_tool.func("T1059.999")
    assert "T1059" in result


def test_mitre_lookup_dataset_covers_full_enterprise_matrix():
    # Regression guard: the dataset should be the full ~700-technique ATT&CK
    # Enterprise set, not the old ~15-entry hardcoded dict.
    from tools import _load_mitre_db
    db = _load_mitre_db()
    assert len(db) > 600
    # Spot check techniques that were NOT in the old hardcoded subset.
    assert "T1055" in db  # Process Injection
    assert "T1548" in db  # Abuse Elevation Control Mechanism


def test_mitre_lookup_unknown_id_returns_safe_fallback_not_a_crash():
    result = mitre_lookup_tool.func("T9999")
    assert "Unknown Technique" in result


# ── Asset Lookup (mock-data branch, no Supabase credentials) ───────────────

def test_asset_lookup_all_returns_compact_list(monkeypatch):
    monkeypatch.delenv("NEXT_PUBLIC_SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    result = asset_lookup_tool.func("ALL")
    assert "Production Web Server" in result
    assert "CRITICAL" in result


def test_asset_lookup_filters_by_query(monkeypatch):
    monkeypatch.delenv("NEXT_PUBLIC_SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    result = asset_lookup_tool.func("PostgreSQL")
    assert "PostgreSQL Database Server" in result
    assert "Production Web Server" not in result


def test_asset_lookup_no_match_returns_explicit_message(monkeypatch):
    monkeypatch.delenv("NEXT_PUBLIC_SUPABASE_URL", raising=False)
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    result = asset_lookup_tool.func("nonexistent-asset-xyz")
    assert "No assets matching" in result
