"""
Tests for risk_engine_py.py — the Python mirror of src/lib/risk_engine.ts.

These lock in the scoring formula's documented behaviour (weights, clamping,
severity thresholds, exposure multiplier) so a future refactor can't silently
change risk classifications without a test failing.
"""

import pytest

from risk_engine_py import (
    calculate_risk_score_py,
    classify_severity,
    RISK_WEIGHTS,
)


def test_weights_sum_to_one():
    assert sum(RISK_WEIGHTS.values()) == pytest.approx(1.0)


@pytest.mark.parametrize("score,expected", [
    (0, "LOW"),
    (29, "LOW"),
    (30, "MEDIUM"),
    (49, "MEDIUM"),
    (50, "HIGH"),
    (69, "HIGH"),
    (70, "CRITICAL"),
    (100, "CRITICAL"),
])
def test_classify_severity_thresholds(score, expected):
    assert classify_severity(score) == expected


def test_log4shell_like_case_is_critical():
    """Log4Shell (CVE-2021-44228): CVSS 10, public exploit, actively exploited,
    internet-facing critical asset — the textbook 'drop everything' case."""
    result = calculate_risk_score_py({
        "cvss_score": 10.0,
        "exploit_availability": "PUBLIC",
        "asset_criticality": "CRITICAL",
        "active_exploitation": True,
        "network_exposure": "internet-facing",
    })
    assert result["severityLabel"] == "CRITICAL"
    assert result["riskScore"] == 100  # clamped at the ceiling


def test_low_severity_internal_theoretical_case():
    """Low CVSS, no exploit, low-criticality internal asset — should stay LOW."""
    result = calculate_risk_score_py({
        "cvss_score": 2.0,
        "exploit_availability": "NONE",
        "asset_criticality": "LOW",
        "active_exploitation": False,
        "network_exposure": "internal",
    })
    assert result["severityLabel"] == "LOW"


def test_air_gapped_asset_scores_lower_than_internet_facing_otherwise_identical():
    base = {
        "cvss_score": 9.0,
        "exploit_availability": "PUBLIC",
        "asset_criticality": "HIGH",
        "active_exploitation": True,
    }
    internet_facing = calculate_risk_score_py({**base, "network_exposure": "internet-facing"})
    air_gapped = calculate_risk_score_py({**base, "network_exposure": "air-gapped"})
    assert internet_facing["riskScore"] > air_gapped["riskScore"]


def test_active_exploitation_outweighs_targeted_campaign_flag():
    """activeExploitation should push the threat-intel component to its max (10),
    beating a merely targeted campaign (6), all else equal."""
    base = {
        "cvss_score": 7.0,
        "exploit_availability": "POC_ONLY",
        "asset_criticality": "MEDIUM",
        "network_exposure": "internal",
    }
    active = calculate_risk_score_py({**base, "active_exploitation": True})
    targeted = calculate_risk_score_py({**base, "active_exploitation": False, "targeted_campaign": True})
    assert active["threatIntelScore"] == 10
    assert targeted["threatIntelScore"] == 6
    assert active["riskScore"] >= targeted["riskScore"]


def test_cvss_score_is_clamped_to_valid_range():
    # Malformed upstream data (e.g. a bad NVD parse) should never crash or exceed 0-10.
    over = calculate_risk_score_py({"cvss_score": 15.0, "exploit_availability": "NONE",
                                     "asset_criticality": "LOW", "active_exploitation": False})
    under = calculate_risk_score_py({"cvss_score": -3.0, "exploit_availability": "NONE",
                                      "asset_criticality": "LOW", "active_exploitation": False})
    assert over["cvssScore"] == 10.0
    assert under["cvssScore"] == 0.0


def test_unknown_enum_values_fall_back_to_safe_defaults():
    result = calculate_risk_score_py({
        "cvss_score": 5.0,
        "exploit_availability": "SOMETHING_UNKNOWN",
        "asset_criticality": "SOMETHING_UNKNOWN",
        "active_exploitation": False,
    })
    assert result["exploitabilityScore"] == 0
    assert result["assetCriticalityScore"] == 5  # MEDIUM default

def test_missing_fields_do_not_raise():
    result = calculate_risk_score_py({})
    assert 0 <= result["riskScore"] <= 100
    assert result["severityLabel"] in {"CRITICAL", "HIGH", "MEDIUM", "LOW"}


def test_riskscore_never_exceeds_100_even_with_exposure_multiplier():
    result = calculate_risk_score_py({
        "cvss_score": 10.0,
        "exploit_availability": "PUBLIC",
        "asset_criticality": "CRITICAL",
        "active_exploitation": True,
        "network_exposure": "internet-facing",  # 1.15x multiplier
    })
    assert result["riskScore"] <= 100
