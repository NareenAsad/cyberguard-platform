'use client'

import { useEffect } from 'react'
import { X, FileText, Download, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'
import type { Report } from '@/types/report'
import { exportReportToPDF } from '@/lib/export-utils'
import { useAuth } from '@/lib/auth/auth-context'
import { decodeReportContent } from '@/lib/opaque-content'

interface ReportDetailPanelProps {
    report: Report | null
    onClose: () => void
}

function postureColor(score?: number) {
    if (score === undefined) return 'text-muted-foreground'
    if (score < 40) return 'text-red-400'
    if (score < 70) return 'text-amber-400'
    return 'text-accent'
}

export function ReportDetailPanel({ report, onClose }: ReportDetailPanelProps) {
    const { can } = useAuth()
    const isOpen = !!report

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!report) return null

    const content = decodeReportContent(report.content)
    const exec = content?.executive_report
    const tech = content?.technical_report
    const comp = content?.compliance_report
    const displayDate = report.generated || report.date
    const formattedDate = displayDate
        ? new Date(displayDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    const severity = exec?.severity_summary ?? {}

    const handleDownload = () => {
        if (!report) return
        exportReportToPDF({ ...report, content })
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Centered modal — designed to read as a single page, not a multi-section dive */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="w-full max-w-xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-start justify-between p-5 border-b border-border bg-background/50">
                        <div className="flex items-start gap-3 pr-4 min-w-0">
                            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-foreground leading-snug truncate">{report.title}</h2>
                                {formattedDate && <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* One-page body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">

                        {!exec ? (
                            <p className="text-sm text-muted-foreground text-center py-10">No summary data available for this report.</p>
                        ) : (
                            <>
                                {/* Posture at a glance */}
                                <div className="flex items-center gap-5 p-4 rounded-xl bg-secondary/20 border border-border">
                                    <div className="text-center shrink-0">
                                        <p className={`text-4xl font-black ${postureColor(exec.posture_score)}`}>{exec.posture_score ?? '—'}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                            {exec.posture_label ?? 'Posture Score'}
                                        </p>
                                    </div>
                                    <div className="flex-1 grid grid-cols-4 gap-2">
                                        {(['critical', 'high', 'medium', 'low'] as const).map(level => (
                                            <div key={level} className="text-center">
                                                <p className={`text-lg font-bold ${
                                                    level === 'critical' ? 'text-red-400' :
                                                    level === 'high' ? 'text-orange-400' :
                                                    level === 'medium' ? 'text-yellow-400' : 'text-accent'
                                                }`}>{severity[level] ?? 0}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase">{level}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* What's happening */}
                                {exec.top_risk && (
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1.5">
                                        <p className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1.5">
                                            <ShieldAlert className="w-3 h-3" /> What's Happening
                                        </p>
                                        <p className="text-sm text-foreground leading-relaxed">{exec.top_risk}</p>
                                    </div>
                                )}

                                {exec.business_impact && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">{exec.business_impact}</p>
                                )}

                                {exec.action_required && (
                                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-bold text-primary uppercase">Action Required</p>
                                            <p className="text-sm text-foreground">{exec.action_required}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Key findings */}
                                {exec.key_findings && exec.key_findings.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Key Findings</p>
                                        <ul className="space-y-1.5">
                                            {exec.key_findings.map((f, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommended priorities */}
                                {exec.recommended_priorities && exec.recommended_priorities.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase">Recommended Priorities</p>
                                        <div className="space-y-2">
                                            {exec.recommended_priorities
                                                .slice()
                                                .sort((a, b) => a.priority - b.priority)
                                                .map((p, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/20 border border-border">
                                                    <span className="text-xs font-bold text-primary shrink-0 w-4">{p.priority}.</span>
                                                    <span className="text-sm text-foreground flex-1">{p.action}</span>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {p.owner && <span className="text-[9px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{p.owner}</span>}
                                                        {p.deadline && <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-semibold">{p.deadline}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Compact detail strip — counts only, full detail is in the PDF export */}
                                {(tech || comp) && (
                                    <div className="flex items-center gap-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                                        {tech?.total_findings !== undefined && <span>{tech.total_findings} technical findings</span>}
                                        {tech?.assets_at_risk && <span>{tech.assets_at_risk.length} assets at risk</span>}
                                        {comp?.overall_compliance_score !== undefined && <span>{comp.overall_compliance_score}% compliance score</span>}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-border bg-background/50 flex gap-3">
                        {can('canExportData') && (
                            <button
                                onClick={handleDownload}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                <Download className="w-4 h-4" />
                                Export Full Analysis (PDF)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
