import { RISK_WEIGHTS, SEVERITY_THRESHOLDS, ASSET_CRITICALITY_MAP } from "./constants";

// Types

export type SeverityLabel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RiskInput {
    cveId: string;
    assetId: string;
    assetName: string;
    cvssBaseScore: number;         // 0–10 from NVD
    exploitAvailability: "PUBLIC" | "POC_ONLY" | "THEORETICAL" | "NONE";
    assetCriticality: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    activeExploitation: boolean;   // confirmed in the wild
    targetedCampaign: boolean;     // seen in threat intel feeds
    patchAvailable: boolean;
    networkExposure: "internet-facing" | "internal" | "air-gapped";
}

export interface RiskScore {
    cveId: string;
    assetId: string;
    assetName: string;

    // Component scores (each 0–10)
    cvssScore: number;
    exploitabilityScore: number;
    assetCriticalityScore: number;
    threatIntelScore: number;

    // Final score (0–100)
    riskScore: number;
    severityLabel: SeverityLabel;
    priorityRank: number;         // Set externally after sorting

    // Context
    patchAvailable: boolean;
    networkExposure: string;
    scoreBreakdown: string;       // Human-readable explanation (Explainable AI)
}

// Core Scoring Function

/**
 * Calculate weighted risk score for a single vulnerability-asset pair.
 * Formula: Risk = (W_s × S_v) + (W_e × E_x) + (W_a × A_c) + (W_t × T_i)
 */
export function calculateRiskScore(input: RiskInput): RiskScore {
    // ── S_v: CVSS Base Score (already 0–10) ──
    const sv = Math.min(10, Math.max(0, input.cvssBaseScore));

    // ── E_x: Exploitability Score (0–10) ──
    const exploitMap: Record<RiskInput["exploitAvailability"], number> = {
        PUBLIC: 10,      // Active exploit in Metasploit / ExploitDB
        POC_ONLY: 6,     // Proof-of-concept code published
        THEORETICAL: 2,  // No public exploit, theoretical possibility
        NONE: 0,
    };
    const ex = exploitMap[input.exploitAvailability] ?? 0;

    // ── A_c: Asset Criticality Score (0–10) ──
    const ac = ASSET_CRITICALITY_MAP[input.assetCriticality] ?? 5;

    // ── T_i: Threat Intel Context Score (0–10) ──
    let ti = 2; // baseline: generic threat
    if (input.targetedCampaign) ti = 6;
    if (input.activeExploitation) ti = 10;

    // ── Network Exposure Modifier ──
    // Internet-facing assets with public exploits are significantly more dangerous
    const exposureMultiplier =
        input.networkExposure === "internet-facing" ? 1.15 :
            input.networkExposure === "internal" ? 1.0 :
                0.7; // air-gapped

    // ── Weighted Formula ──
    const rawScore =
        (RISK_WEIGHTS.cvss * sv) +
        (RISK_WEIGHTS.exploitability * ex) +
        (RISK_WEIGHTS.assetCriticality * ac) +
        (RISK_WEIGHTS.threatIntel * ti);

    // Normalize to 0–100 and apply exposure multiplier
    const normalizedScore = Math.min(100, Math.round(rawScore * 10 * exposureMultiplier));

    // ── Severity Label ──
    const severityLabel = classifySeverity(normalizedScore);

    // ── Explainable AI: Score Breakdown ──
    const scoreBreakdown = buildExplanation(input, sv, ex, ac, ti, normalizedScore, exposureMultiplier);

    return {
        cveId: input.cveId,
        assetId: input.assetId,
        assetName: input.assetName,
        cvssScore: sv,
        exploitabilityScore: ex,
        assetCriticalityScore: ac,
        threatIntelScore: ti,
        riskScore: normalizedScore,
        severityLabel,
        priorityRank: 0, // assigned after batch sorting
        patchAvailable: input.patchAvailable,
        networkExposure: input.networkExposure,
        scoreBreakdown,
    };
}


/**
 * Score a batch of vulnerabilities and return them ranked by priority.
 */
export function scoreBatch(inputs: RiskInput[]): RiskScore[] {
    const scored = inputs.map(calculateRiskScore);

    // Sort: highest risk first, then by CVSS score as tiebreaker
    scored.sort((a, b) => b.riskScore - a.riskScore || b.cvssScore - a.cvssScore);

    // Assign priority rank
    scored.forEach((s, i) => { s.priorityRank = i + 1; });

    return scored;
}


/**
 * Classify a numeric score (0–100) into a severity label.
 */
export function classifySeverity(score: number): SeverityLabel {
    if (score >= SEVERITY_THRESHOLDS.CRITICAL) return "CRITICAL";
    if (score >= SEVERITY_THRESHOLDS.HIGH) return "HIGH";
    if (score >= SEVERITY_THRESHOLDS.MEDIUM) return "MEDIUM";
    return "LOW";
}


/**
 * Build a human-readable explanation of the score (Explainable AI requirement).
 */
function buildExplanation(
    input: RiskInput,
    sv: number,
    ex: number,
    ac: number,
    ti: number,
    finalScore: number,
    exposureMultiplier: number
): string {
    const lines: string[] = [
        `Risk Score: ${finalScore}/100 (${classifySeverity(finalScore)})`,
        ``,
        `Score Breakdown:`,
        `  • CVSS Base Score:     ${sv.toFixed(1)}/10  × weight ${RISK_WEIGHTS.cvss}  = ${(sv * RISK_WEIGHTS.cvss).toFixed(2)}`,
        `  • Exploitability:      ${ex.toFixed(1)}/10  × weight ${RISK_WEIGHTS.exploitability}  = ${(ex * RISK_WEIGHTS.exploitability).toFixed(2)}  (${input.exploitAvailability})`,
        `  • Asset Criticality:   ${ac.toFixed(1)}/10  × weight ${RISK_WEIGHTS.assetCriticality}  = ${(ac * RISK_WEIGHTS.assetCriticality).toFixed(2)}  (${input.assetCriticality})`,
        `  • Threat Intel:        ${ti.toFixed(1)}/10  × weight ${RISK_WEIGHTS.threatIntel}  = ${(ti * RISK_WEIGHTS.threatIntel).toFixed(2)}  (${input.activeExploitation ? "Active exploitation confirmed" : input.targetedCampaign ? "Targeted campaign" : "Generic threat"})`,
        `  • Network Exposure:    ${input.networkExposure} (×${exposureMultiplier})`,
        ``,
        `Why this score matters:`,
    ];

    if (finalScore >= 70) {
        lines.push(`  CRITICAL: This combination of ${input.cvssBaseScore >= 9 ? "severe CVSS score" : "factors"}, ${input.activeExploitation ? "confirmed active exploitation," : ""} and ${input.assetCriticality} asset criticality requires IMMEDIATE response.`);
    } else if (finalScore >= 50) {
        lines.push(`  HIGH: Elevated risk due to ${ex >= 6 ? "availability of public exploits" : "threat context"}. Remediate within 24 hours.`);
    } else if (finalScore >= 30) {
        lines.push(`  MEDIUM: Moderate risk. Schedule remediation in the current sprint.`);
    } else {
        lines.push(`  LOW: Low immediate risk. Track and remediate during next maintenance window.`);
    }

    if (!input.patchAvailable) {
        lines.push(`  No patch available — apply compensating controls immediately.`);
    }

    return lines.join("\n");
}


/**
 * Generate a summary statistics object for the dashboard.
 */
export function generateRiskSummary(scores: RiskScore[]): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    overallPostureScore: number;
    topRisks: RiskScore[];
} {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const s of scores) {
        if (s.severityLabel === "CRITICAL") counts.critical++;
        else if (s.severityLabel === "HIGH") counts.high++;
        else if (s.severityLabel === "MEDIUM") counts.medium++;
        else counts.low++;
    }

    // Posture score: 100 = perfect, penalized heavily for criticals
    const posturePenalty =
        counts.critical * 15 +
        counts.high * 8 +
        counts.medium * 3 +
        counts.low * 1;
    const overallPostureScore = Math.max(0, 100 - posturePenalty);

    return {
        total: scores.length,
        ...counts,
        overallPostureScore,
        topRisks: scores.slice(0, 5),  // Top 5 for dashboard widget
    };
}