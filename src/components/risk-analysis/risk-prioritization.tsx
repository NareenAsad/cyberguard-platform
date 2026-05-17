'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Zap, ShieldAlert, ShieldCheck, Info } from 'lucide-react'

interface Risk {
    id?: string
    assetName?: string
    asset?: string
    riskLevel: number
    vulnerabilities?: number
    exposureTime?: string
    recommendation?: string
    [key: string]: any
}

interface RiskPrioritizationProps {
    risks: Risk[]
}

// ─── Generate a plain-English action from risk level ───────────────────────────
function getHumanRecommendation(riskLevel: number, assetName?: string): string {
    const asset = assetName || 'this asset'
    if (riskLevel >= 90) return `Immediate action required: Isolate ${asset} from the network and apply all critical patches now. Escalate to the security team.`
    if (riskLevel >= 70) return `High priority: Apply security patches to ${asset} within 24 hours. Enable enhanced monitoring and review access controls.`
    if (riskLevel >= 50) return `Schedule patching for ${asset} within 7 days. Implement additional firewall rules and audit user permissions.`
    if (riskLevel >= 30) return `Low urgency: Review and harden the configuration of ${asset}. Ensure routine patching is up to date.`
    return `${asset} is within acceptable risk range. Continue regular monitoring and standard patching schedule.`
}

// ─── Detect if the recommendation string is a raw formula ──────────────────────
function isRawFormula(text?: string): boolean {
    if (!text) return false
    // Formula strings typically contain patterns like "= 10", "×", "(assuming", "Final –"
    return /(\d+\.\d+|\bBase\b|\bFinal\b|\bMultiplier\b|assuming|×|\bS\s?v\b|\bE\s?x\b)/i.test(text)
}

// ─── Severity helpers ──────────────────────────────────────────────────────────
function getSeverityLabel(level: number) {
    if (level >= 70) return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30' }
    if (level >= 50) return { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' }
    if (level >= 30) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30' }
    return { label: 'Low', color: 'text-accent', bg: 'bg-accent/15 border-accent/30' }
}

function getBarColor(level: number) {
    if (level >= 70) return 'bg-red-500'
    if (level >= 50) return 'bg-amber-500'
    if (level >= 30) return 'bg-yellow-400'
    return 'bg-accent'
}

function getBarBg(level: number) {
    if (level >= 70) return 'bg-red-500/15'
    if (level >= 50) return 'bg-amber-500/15'
    if (level >= 30) return 'bg-yellow-500/15'
    return 'bg-accent/15'
}

// ─── Individual Risk Card ──────────────────────────────────────────────────────
function RiskCard({ risk, index }: { risk: Risk; index: number }) {
    const [showRaw, setShowRaw] = useState(false)

    const assetName = risk.assetName || risk.asset || 'Unknown Asset'
    const severity = getSeverityLabel(risk.riskLevel)
    const rawIsFormula = isRawFormula(risk.recommendation)

    // If it's a formula → generate friendly text, keep raw for toggle
    // If it's already readable → show it directly
    const friendlyText = rawIsFormula
        ? getHumanRecommendation(risk.riskLevel, assetName)
        : (risk.recommendation || getHumanRecommendation(risk.riskLevel, assetName))

    const ActionIcon = risk.riskLevel >= 70 ? ShieldAlert : risk.riskLevel >= 50 ? Zap : ShieldCheck

    return (
        <div className="border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
            {/* Top accent line */}
            <div className={`h-0.5 w-full ${getBarColor(risk.riskLevel)}`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{index + 1}.</span>
                        <h4 className="font-semibold text-foreground text-sm">{assetName}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${severity.bg} ${severity.color}`}>
                            {severity.label}
                        </span>
                        <span className={`text-base font-black ${severity.color}`}>
                            {risk.riskLevel}%
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className={`h-1.5 rounded-full mb-4 overflow-hidden ${getBarBg(risk.riskLevel)}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${getBarColor(risk.riskLevel)}`}
                        style={{ width: `${risk.riskLevel}%` }}
                    />
                </div>

                {/* Meta row */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-secondary/40 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Vulnerabilities</p>
                        <p className="font-bold text-foreground text-sm">{risk.vulnerabilities ?? '—'}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Exposure</p>
                        <p className="font-bold text-foreground text-sm">{risk.exposureTime ?? 'Active'}</p>
                    </div>
                    <div className="bg-secondary/40 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Score</p>
                        <p className={`font-bold text-sm ${severity.color}`}>{risk.riskLevel}/100</p>
                    </div>
                </div>

                {/* ── Recommendation box ─────────────────────────────── */}
                <div className={`rounded-lg border p-3.5 ${
                    risk.riskLevel >= 70
                        ? 'bg-red-500/5 border-red-500/20'
                        : risk.riskLevel >= 50
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-accent/5 border-accent/20'
                }`}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <ActionIcon className={`w-3.5 h-3.5 ${severity.color}`} />
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${severity.color}`}>
                            Recommended Action
                        </p>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{friendlyText}</p>

                    {/* Show raw formula toggle — only if the stored text is a formula */}
                    {rawIsFormula && risk.recommendation && (
                        <button
                            onClick={() => setShowRaw(v => !v)}
                            className="flex items-center gap-1 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Info className="w-3 h-3" />
                            {showRaw ? 'Hide' : 'Show'} technical score breakdown
                            {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    )}

                    {showRaw && (
                        <div className="mt-2 p-2.5 bg-secondary/60 rounded-md border border-border">
                            <p className="text-[10px] font-mono text-muted-foreground leading-relaxed break-all">
                                {risk.recommendation}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function RiskPrioritization({ risks }: RiskPrioritizationProps) {
    if (!risks || risks.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-md bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Risk Prioritization</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground opacity-30 mb-3" />
                    <p className="text-muted-foreground text-sm">No risk data to prioritize</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-md bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Risk Prioritization</h3>
                <span className="ml-auto text-xs text-muted-foreground">{risks.length} asset{risks.length !== 1 ? 's' : ''} ranked by risk</span>
            </div>

            <div className="space-y-4">
                {risks.map((risk, index) => (
                    <RiskCard key={risk.id ?? `${risk.assetName}-${index}`} risk={risk} index={index} />
                ))}
            </div>
        </div>
    )
}
