// Risk Score Weights (must sum to 1.0)
export const RISK_WEIGHTS = {
    cvss: 0.30,
    exploitability: 0.25,
    assetCriticality: 0.25,
    threatIntel: 0.20,
} as const;

// Verify weights sum to 1.0 at import time (development guard)
const weightSum = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
    console.warn(`[CyberGuard] RISK_WEIGHTS do not sum to 1.0 (got ${weightSum})`);
}


// Severity Classification Thresholds
export const SEVERITY_THRESHOLDS = {
    CRITICAL: 70,
    HIGH: 50,
    MEDIUM: 30,
    LOW: 0,
} as const;


// Asset Criticality Numeric Values (0–10 scale)
export const ASSET_CRITICALITY_MAP: Record<string, number> = {
    CRITICAL: 10,
    HIGH: 7,
    MEDIUM: 5,
    LOW: 2,
};


// Response SLA (in hours) by Severity
export const RESPONSE_SLA_HOURS = {
    CRITICAL: 4,
    HIGH: 24,
    MEDIUM: 336,
    LOW: 2160,
} as const;


// Alert Color Codes for Dashboard
export const SEVERITY_COLORS = {
    CRITICAL: "#EF4444",
    HIGH: "#F97316",
    MEDIUM: "#EAB308",
    LOW: "#22C55E",
} as const;


// Crew AI / Agent Configuration
export const AGENT_CONFIG = {
    model: "claude-haiku-4-5-20251001",
    temperature: 0.1,
    maxTokens: 4096,
    maxIterations: 5,
} as const;


// Data Collection Polling Intervals (ms)
export const POLLING_INTERVALS = {
    nvd: 6 * 60 * 60 * 1000,
    otx: 2 * 60 * 60 * 1000,
    threatfox: 1 * 60 * 60 * 1000,
    urlhaus: 30 * 60 * 1000,
    abuseipdb: 15 * 60 * 1000,
} as const;


// Minimum Confidence Threshold for IoCs
export const MIN_INDICATOR_CONFIDENCE = 60;


// Dashboard Refresh Rate
export const DASHBOARD_REFRESH_MS = 30_000;