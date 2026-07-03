"""
evaluate.py — Standalone evaluation report for the risk-scoring engine.

Run: python evaluate.py [--markdown]

Prints a human-readable table comparing each benchmark case's expected
severity (real-world/industry consensus for known incidents) against the
engine's actual output, plus overall accuracy. Pass --markdown to emit a
GitHub-flavored Markdown table instead (suitable for pasting into an FYP
report or docs/EVALUATION.md).

This does NOT call the CrewAI/Groq pipeline — it evaluates the deterministic
risk_score_py formula in isolation, which is what makes it fast, free, and
reproducible without API credentials.
"""

import argparse
import json
import os
import sys
from pathlib import Path

from risk_engine_py import calculate_risk_score_py

# Windows console defaults to cp1252, which can't encode the ✅/❌ markers below.
if os.name == "nt" and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BENCHMARK_PATH = Path(__file__).resolve().parent / "data" / "risk_scoring_benchmark.json"


def run(markdown: bool) -> int:
    with open(BENCHMARK_PATH, "r", encoding="utf-8") as f:
        bundle = json.load(f)
    cases = bundle["cases"]

    rows = []
    correct = 0
    for case in cases:
        result = calculate_risk_score_py(case["input"])
        passed = result["severityLabel"] == case["expected_severity"]
        correct += int(passed)
        rows.append({
            "id": case["id"],
            "cve": case["cve"],
            "label": case["label"],
            "expected": case["expected_severity"],
            "actual": result["severityLabel"],
            "score": result["riskScore"],
            "pass": passed,
        })

    accuracy = correct / len(cases) if cases else 0.0

    if markdown:
        print(f"# Risk-Scoring Engine — Evaluation Report\n")
        print(f"**Accuracy on labeled benchmark set: {correct}/{len(cases)} ({accuracy:.0%})**\n")
        print("| Case | CVE | Expected | Actual | Score | Result |")
        print("|---|---|---|---|---|---|")
        for r in rows:
            mark = "✅" if r["pass"] else "❌"
            print(f"| {r['label']} | {r['cve']} | {r['expected']} | {r['actual']} | {r['score']} | {mark} |")
    else:
        print(f"Risk-Scoring Engine Evaluation — {correct}/{len(cases)} correct ({accuracy:.0%})\n")
        for r in rows:
            mark = "PASS" if r["pass"] else "FAIL"
            print(f"[{mark}] {r['label']:55s} expected={r['expected']:8s} actual={r['actual']:8s} score={r['score']:>3}  ({r['cve']})")

    return 0 if accuracy == 1.0 else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--markdown", action="store_true")
    args = parser.parse_args()
    raise SystemExit(run(markdown=args.markdown))
