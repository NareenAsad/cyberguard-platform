import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateRiskScore, type RiskInput, type SeverityLabel } from "./risk_engine";

/**
 * Evaluation harness for the TypeScript risk-scoring engine, mirroring
 * .agents/tests/test_evaluation_benchmark.py. Both load the SAME benchmark
 * file (.agents/data/risk_scoring_benchmark.json) so a passing suite on
 * both sides is also evidence the TS and Python engines agree on real
 * incidents, not just on paper.
 */

interface BenchmarkCase {
    id: string;
    cve: string;
    label: string;
    input: {
        cvss_score: number;
        exploit_availability: RiskInput["exploitAvailability"];
        asset_criticality: RiskInput["assetCriticality"];
        active_exploitation: boolean;
        targeted_campaign: boolean;
        network_exposure: RiskInput["networkExposure"];
    };
    expected_severity: SeverityLabel;
    rationale: string;
}

const BENCHMARK_PATH = join(__dirname, "..", "..", ".agents", "data", "risk_scoring_benchmark.json");
const bundle = JSON.parse(readFileSync(BENCHMARK_PATH, "utf-8")) as { cases: BenchmarkCase[] };
const cases = bundle.cases;

function toRiskInput(c: BenchmarkCase): RiskInput {
    return {
        cveId: c.cve,
        assetId: "benchmark-asset",
        assetName: c.label,
        cvssBaseScore: c.input.cvss_score,
        exploitAvailability: c.input.exploit_availability,
        assetCriticality: c.input.asset_criticality,
        activeExploitation: c.input.active_exploitation,
        targetedCampaign: c.input.targeted_campaign,
        patchAvailable: false,
        networkExposure: c.input.network_exposure,
    };
}

describe("risk-scoring engine — known-incident benchmark (TS)", () => {
    it.each(cases.map((c) => [c.id, c] as const))("%s classifies as expected severity", (_id, c) => {
        const result = calculateRiskScore(toRiskInput(c));
        expect(
            result.severityLabel,
            `${c.label} (${c.cve}): expected ${c.expected_severity}, got ${result.severityLabel} (score=${result.riskScore}). ${c.rationale}`
        ).toBe(c.expected_severity);
    });

    it("scores 100% accuracy across the full labeled benchmark set", () => {
        const correct = cases.filter((c) => calculateRiskScore(toRiskInput(c)).severityLabel === c.expected_severity);
        expect(correct.length).toBe(cases.length);
    });
});

describe("risk-scoring engine — monotonicity / internal consistency", () => {
    const base: RiskInput = {
        cveId: "MONO-TEST",
        assetId: "asset",
        assetName: "asset",
        cvssBaseScore: 5.0,
        exploitAvailability: "NONE",
        assetCriticality: "MEDIUM",
        activeExploitation: false,
        targetedCampaign: false,
        patchAvailable: true,
        networkExposure: "internal",
    };

    it("never scores a lower CVSS higher than a higher CVSS", () => {
        const low = calculateRiskScore({ ...base, cvssBaseScore: 3 });
        const high = calculateRiskScore({ ...base, cvssBaseScore: 9 });
        expect(high.riskScore).toBeGreaterThanOrEqual(low.riskScore);
    });

    it.each([
        ["PUBLIC", "POC_ONLY"],
        ["POC_ONLY", "THEORETICAL"],
        ["THEORETICAL", "NONE"],
    ] as const)("exploit availability %s scores >= %s", (worse, better) => {
        const worseResult = calculateRiskScore({ ...base, exploitAvailability: worse });
        const betterResult = calculateRiskScore({ ...base, exploitAvailability: better });
        expect(worseResult.riskScore).toBeGreaterThanOrEqual(betterResult.riskScore);
    });

    it.each([
        ["CRITICAL", "HIGH"],
        ["HIGH", "MEDIUM"],
        ["MEDIUM", "LOW"],
    ] as const)("asset criticality %s scores >= %s", (worse, better) => {
        const worseResult = calculateRiskScore({ ...base, assetCriticality: worse });
        const betterResult = calculateRiskScore({ ...base, assetCriticality: better });
        expect(worseResult.riskScore).toBeGreaterThanOrEqual(betterResult.riskScore);
    });

    it("active exploitation never scores lower than no active exploitation", () => {
        const without = calculateRiskScore({ ...base, activeExploitation: false });
        const withIt = calculateRiskScore({ ...base, activeExploitation: true });
        expect(withIt.riskScore).toBeGreaterThanOrEqual(without.riskScore);
    });

    it.each([
        ["internet-facing", "internal"],
        ["internal", "air-gapped"],
    ] as const)("network exposure %s scores >= %s", (worse, better) => {
        const worseResult = calculateRiskScore({ ...base, networkExposure: worse });
        const betterResult = calculateRiskScore({ ...base, networkExposure: better });
        expect(worseResult.riskScore).toBeGreaterThanOrEqual(betterResult.riskScore);
    });
});
