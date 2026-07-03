import { describe, it, expect } from "vitest";
import {
    calculateRiskScore,
    classifySeverity,
    scoreBatch,
    generateRiskSummary,
    type RiskInput,
} from "./risk_engine";
import { RISK_WEIGHTS } from "./constants";

function baseInput(overrides: Partial<RiskInput> = {}): RiskInput {
    return {
        cveId: "CVE-TEST-0001",
        assetId: "asset-1",
        assetName: "Test Asset",
        cvssBaseScore: 5.0,
        exploitAvailability: "NONE",
        assetCriticality: "MEDIUM",
        activeExploitation: false,
        targetedCampaign: false,
        patchAvailable: true,
        networkExposure: "internal",
        ...overrides,
    };
}

describe("RISK_WEIGHTS", () => {
    it("sums to 1.0", () => {
        const sum = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
        expect(sum).toBeCloseTo(1.0, 5);
    });
});

describe("classifySeverity", () => {
    it.each([
        [0, "LOW"],
        [29, "LOW"],
        [30, "MEDIUM"],
        [49, "MEDIUM"],
        [50, "HIGH"],
        [69, "HIGH"],
        [70, "CRITICAL"],
        [100, "CRITICAL"],
    ] as const)("classifies score %i as %s", (score, expected) => {
        expect(classifySeverity(score)).toBe(expected);
    });
});

describe("calculateRiskScore", () => {
    it("scores a Log4Shell-like case as CRITICAL and caps at 100", () => {
        const result = calculateRiskScore(
            baseInput({
                cvssBaseScore: 10,
                exploitAvailability: "PUBLIC",
                assetCriticality: "CRITICAL",
                activeExploitation: true,
                networkExposure: "internet-facing",
            })
        );
        expect(result.severityLabel).toBe("CRITICAL");
        expect(result.riskScore).toBe(100);
    });

    it("scores a low-CVSS internal asset with no exploit as LOW", () => {
        const result = calculateRiskScore(
            baseInput({
                cvssBaseScore: 2,
                exploitAvailability: "NONE",
                assetCriticality: "LOW",
                activeExploitation: false,
                networkExposure: "internal",
            })
        );
        expect(result.severityLabel).toBe("LOW");
    });

    it("scores an internet-facing asset higher than an otherwise identical air-gapped one", () => {
        const shared = {
            cvssBaseScore: 9,
            exploitAvailability: "PUBLIC" as const,
            assetCriticality: "HIGH" as const,
            activeExploitation: true,
        };
        const internetFacing = calculateRiskScore(baseInput({ ...shared, networkExposure: "internet-facing" }));
        const airGapped = calculateRiskScore(baseInput({ ...shared, networkExposure: "air-gapped" }));
        expect(internetFacing.riskScore).toBeGreaterThan(airGapped.riskScore);
    });

    it("weighs confirmed active exploitation above a merely targeted campaign", () => {
        const shared = {
            cvssBaseScore: 7,
            exploitAvailability: "POC_ONLY" as const,
            assetCriticality: "MEDIUM" as const,
            networkExposure: "internal" as const,
        };
        const active = calculateRiskScore(baseInput({ ...shared, activeExploitation: true }));
        const targeted = calculateRiskScore(baseInput({ ...shared, activeExploitation: false, targetedCampaign: true }));
        expect(active.threatIntelScore).toBe(10);
        expect(targeted.threatIntelScore).toBe(6);
        expect(active.riskScore).toBeGreaterThanOrEqual(targeted.riskScore);
    });

    it("clamps out-of-range CVSS scores to 0-10", () => {
        const over = calculateRiskScore(baseInput({ cvssBaseScore: 15 }));
        const under = calculateRiskScore(baseInput({ cvssBaseScore: -3 }));
        expect(over.cvssScore).toBe(10);
        expect(under.cvssScore).toBe(0);
    });

    it("never exceeds a riskScore of 100 even with the internet-facing multiplier", () => {
        const result = calculateRiskScore(
            baseInput({
                cvssBaseScore: 10,
                exploitAvailability: "PUBLIC",
                assetCriticality: "CRITICAL",
                activeExploitation: true,
                networkExposure: "internet-facing",
            })
        );
        expect(result.riskScore).toBeLessThanOrEqual(100);
    });

    it("includes a human-readable score breakdown for explainability", () => {
        const result = calculateRiskScore(baseInput());
        expect(result.scoreBreakdown).toContain("Risk Score:");
        expect(result.scoreBreakdown).toContain("CVSS Base Score:");
    });

    it("flags missing patch availability in the explanation", () => {
        const result = calculateRiskScore(baseInput({ patchAvailable: false }));
        expect(result.scoreBreakdown).toContain("No patch available");
    });
});

describe("scoreBatch", () => {
    it("ranks results highest-risk first and assigns sequential priorityRank", () => {
        const low = baseInput({ cveId: "CVE-LOW", cvssBaseScore: 2, assetCriticality: "LOW" });
        const high = baseInput({
            cveId: "CVE-HIGH",
            cvssBaseScore: 9.8,
            exploitAvailability: "PUBLIC",
            assetCriticality: "CRITICAL",
            activeExploitation: true,
            networkExposure: "internet-facing",
        });
        const [first, second] = scoreBatch([low, high]);

        expect(first.cveId).toBe("CVE-HIGH");
        expect(second.cveId).toBe("CVE-LOW");
        expect(first.priorityRank).toBe(1);
        expect(second.priorityRank).toBe(2);
    });
});

describe("generateRiskSummary", () => {
    it("penalizes the posture score more heavily for criticals than lows", () => {
        const scored = scoreBatch([
            baseInput({
                cveId: "CVE-CRIT",
                cvssBaseScore: 10,
                exploitAvailability: "PUBLIC",
                assetCriticality: "CRITICAL",
                activeExploitation: true,
                networkExposure: "internet-facing",
            }),
        ]);
        const summary = generateRiskSummary(scored);
        expect(summary.critical).toBe(1);
        expect(summary.overallPostureScore).toBe(85); // 100 - 15 (one critical)
    });

    it("returns a perfect posture score for an empty result set", () => {
        const summary = generateRiskSummary([]);
        expect(summary.overallPostureScore).toBe(100);
        expect(summary.total).toBe(0);
    });

    it("never drops the posture score below 0", () => {
        const scored = scoreBatch(
            Array.from({ length: 10 }, (_, i) =>
                baseInput({
                    cveId: `CVE-${i}`,
                    cvssBaseScore: 10,
                    exploitAvailability: "PUBLIC",
                    assetCriticality: "CRITICAL",
                    activeExploitation: true,
                    networkExposure: "internet-facing",
                })
            )
        );
        const summary = generateRiskSummary(scored);
        expect(summary.overallPostureScore).toBeGreaterThanOrEqual(0);
    });
});
