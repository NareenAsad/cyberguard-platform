// Risk Score Weights (must sum to 1.0)
export const RISK_WEIGHTS = {
    cvss: 0.30,             // CVSS Base Score weight (technical severity)
    exploitability: 0.25,   // Exploit availability weight
    assetCriticality: 0.25, // Business importance of the asset
    threatIntel: 0.20,      // Active threat context weight
} as const;

// Verify weights sum to 1.0 at import time (development guard)
const weightSum = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
    console.warn(`[CyberGuard] RISK_WEIGHTS do not sum to 1.0 (got ${weightSum})`);
}


// Severity Classification Thresholds
export const SEVERITY_THRESHOLDS = {
    CRITICAL: 70,   // Score 70–100: Immediate response, auto-alert, auto-playbook
    HIGH: 50,       // Score 50–69: Fix within 24 hours
    MEDIUM: 30,     // Score 30–49: Fix within current sprint (2 weeks)
    LOW: 0,         // Score  0–29: Next maintenance window
} as const;


// Asset Criticality Numeric Values (0–10 scale)
export const ASSET_CRITICALITY_MAP: Record<string, number> = {
    CRITICAL: 10,  // Production systems, customer-facing, revenue-critical
    HIGH: 7,       // Internal services used by most employees
    MEDIUM: 5,     // Supporting services, development systems
    LOW: 2,        // Test environments, isolated systems
};


// Response SLA (in hours) by Severity
export const RESPONSE_SLA_HOURS = {
    CRITICAL: 4,    // Respond within 4 hours
    HIGH: 24,       // Respond within 24 hours
    MEDIUM: 336,    // Respond within 2 weeks (14 days × 24)
    LOW: 2160,      // Respond within 90 days
} as const;


// Alert Color Codes for Dashboard
export const SEVERITY_COLORS = {
    CRITICAL: "#EF4444",  // red-500
    HIGH: "#F97316",      // orange-500
    MEDIUM: "#EAB308",    // yellow-500
    LOW: "#22C55E",       // green-500
} as const;


// Crew AI / Agent Configuration
export const AGENT_CONFIG = {
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    maxTokens: 2048,
    maxIterations: 5,
    groqMaxRpm: 30,
} as const;


// Data Collection Polling Intervals (ms)
export const POLLING_INTERVALS = {
    nvd: 6 * 60 * 60 * 1000,        // Every 6 hours
    otx: 2 * 60 * 60 * 1000,        // Every 2 hours
    threatfox: 1 * 60 * 60 * 1000,  // Every 1 hour
    urlhaus: 30 * 60 * 1000,         // Every 30 minutes
    abuseipdb: 15 * 60 * 1000,       // Every 15 minutes
} as const;


// Minimum Confidence Threshold for IoCs
export const MIN_INDICATOR_CONFIDENCE = 60;  // 0–100; below this = discard


// Dashboard Refresh Rate
export const DASHBOARD_REFRESH_MS = 30_000;  // 30 seconds via Socket.io