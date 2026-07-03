"""
Evaluation harness for the risk-scoring engine (risk_engine_py.py).

This is a rule-based weighted formula, not a trained classifier, so there is
no train/test split or held-out accuracy in the ML sense. Instead this file
checks two things that matter for an FYP-grade evaluation:

1. Face validity — does the formula agree with real-world/industry-consensus
   severity on well-documented incidents (Log4Shell, EternalBlue, Heartbleed,
   the Equifax Struts breach, PrintNightmare)? The labeled cases live in
   data/risk_scoring_benchmark.json, shared with the TypeScript mirror of
   this engine (src/lib/risk_engine.benchmark.test.ts) so both
   implementations are checked against the same ground truth.

2. Internal consistency (monotonicity) — increasing any risk-increasing
   input should never *decrease* the output score. A rule-based scoring
   engine that violates this would be actively misleading analysts.

Run standalone for a human-readable report: `python evaluate.py`
"""

import json
from pathlib import Path

import pytest

from risk_engine_py import calculate_risk_score_py

BENCHMARK_PATH = Path(__file__).resolve().parent.parent / "data" / "risk_scoring_benchmark.json"


def load_benchmark_cases() -> list[dict]:
    with open(BENCHMARK_PATH, "r", encoding="utf-8") as f:
        return json.load(f)["cases"]


BENCHMARK_CASES = load_benchmark_cases()


@pytest.mark.parametrize(
    "case",
    BENCHMARK_CASES,
    ids=[c["id"] for c in BENCHMARK_CASES],
)
def test_known_incident_severity_matches_expected(case):
    result = calculate_risk_score_py(case["input"])
    assert result["severityLabel"] == case["expected_severity"], (
        f"{case['label']} ({case['cve']}): expected {case['expected_severity']}, "
        f"got {result['severityLabel']} (score={result['riskScore']}). {case['rationale']}"
    )


def test_benchmark_accuracy_is_100_percent():
    """
    Aggregate accuracy across the whole labeled set. Kept as a single assert
    (rather than relying only on the parametrized per-case tests above) so a
    regression shows up as one clear number, useful for citing directly in a
    report ("8/8 known-incident test cases correctly classified").
    """
    correct = 0
    for case in BENCHMARK_CASES:
        result = calculate_risk_score_py(case["input"])
        if result["severityLabel"] == case["expected_severity"]:
            correct += 1
    accuracy = correct / len(BENCHMARK_CASES)
    assert accuracy == 1.0, f"Benchmark accuracy: {correct}/{len(BENCHMARK_CASES)} ({accuracy:.0%})"


# ── Monotonicity / internal-consistency checks ──────────────────────────────

BASE_CASE = {
    "cvss_score": 5.0,
    "exploit_availability": "NONE",
    "asset_criticality": "MEDIUM",
    "active_exploitation": False,
    "targeted_campaign": False,
    "network_exposure": "internal",
}


def test_higher_cvss_never_scores_lower():
    low = calculate_risk_score_py({**BASE_CASE, "cvss_score": 3.0})
    high = calculate_risk_score_py({**BASE_CASE, "cvss_score": 9.0})
    assert high["riskScore"] >= low["riskScore"]


@pytest.mark.parametrize("worse,better", [
    ("PUBLIC", "POC_ONLY"),
    ("POC_ONLY", "THEORETICAL"),
    ("THEORETICAL", "NONE"),
])
def test_exploit_availability_ordering_is_monotonic(worse, better):
    worse_result = calculate_risk_score_py({**BASE_CASE, "exploit_availability": worse})
    better_result = calculate_risk_score_py({**BASE_CASE, "exploit_availability": better})
    assert worse_result["riskScore"] >= better_result["riskScore"]


@pytest.mark.parametrize("worse,better", [
    ("CRITICAL", "HIGH"),
    ("HIGH", "MEDIUM"),
    ("MEDIUM", "LOW"),
])
def test_asset_criticality_ordering_is_monotonic(worse, better):
    worse_result = calculate_risk_score_py({**BASE_CASE, "asset_criticality": worse})
    better_result = calculate_risk_score_py({**BASE_CASE, "asset_criticality": better})
    assert worse_result["riskScore"] >= better_result["riskScore"]


def test_active_exploitation_never_scores_lower_than_no_exploitation():
    without = calculate_risk_score_py({**BASE_CASE, "active_exploitation": False})
    with_it = calculate_risk_score_py({**BASE_CASE, "active_exploitation": True})
    assert with_it["riskScore"] >= without["riskScore"]


@pytest.mark.parametrize("worse,better", [
    ("internet-facing", "internal"),
    ("internal", "air-gapped"),
])
def test_network_exposure_ordering_is_monotonic(worse, better):
    worse_result = calculate_risk_score_py({**BASE_CASE, "network_exposure": worse})
    better_result = calculate_risk_score_py({**BASE_CASE, "network_exposure": better})
    assert worse_result["riskScore"] >= better_result["riskScore"]
