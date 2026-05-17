'use client'

import { useEffect } from 'react'
import { X, FileText, Download, CheckCircle, Clock, Shield, AlertTriangle, List, Activity, Target } from 'lucide-react'
import type { Report } from '@/types/report'
import { exportReportToPDF } from '@/lib/export-utils'
import { useAuth } from '@/lib/auth/auth-context'

interface ReportDetailPanelProps {
    report: Report | null
    onClose: () => void
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

    const isCompleted = report.status === 'completed' || report.status === 'final'
    const content = report.content

    const handleDownload = () => {
        if (!report) return
        exportReportToPDF(report)
    }

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Centered modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-border bg-background/50">
                        <div className="flex items-start gap-3 pr-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isCompleted ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                        {report.status}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest bg-secondary/50 px-2 py-0.5 rounded-full border border-border">
                                        {report.type}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-foreground leading-snug">{report.title}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scrollable content body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">

                        {/* 1. Executive Summary */}
                        {content?.executive_report && (
                            <section className="space-y-4">
                                <SectionHeader icon={Activity} title="Executive Summary" />
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <MetricCard label="Posture Score" value={`${content.executive_report.posture_score}%`} color="text-primary" />
                                    <MetricCard label="Critical Issues" value={content.executive_report.severity_summary?.critical ?? 0} color="text-red-400" />
                                    <MetricCard label="High Issues" value={content.executive_report.severity_summary?.high ?? 0} color="text-orange-400" />
                                    <MetricCard label="Action Count" value={content.executive_report.action_required ? 1 : 0} color="text-blue-400" />
                                </div>
                                {content.executive_report.top_risk && (
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                                        <p className="text-[10px] font-bold text-red-400 uppercase">Primary Threat</p>
                                        <p className="text-sm font-medium text-foreground">{content.executive_report.top_risk}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* 2. Technical Findings */}
                        {content?.technical_report && (
                            <section className="space-y-4">
                                <SectionHeader icon={Shield} title="Technical Findings" />

                                {/* Patches */}
                                {content.technical_report.immediate_patches && content.technical_report.immediate_patches.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                            <Target className="w-3 h-3" /> Required Remediation
                                        </p>
                                        <div className="space-y-2">
                                            {content.technical_report.immediate_patches.map((patch, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border text-xs flex flex-col gap-2">
                                                    <div className="flex justify-between font-bold text-foreground">
                                                        <span>{patch.cve_id}</span>
                                                        <span className="text-muted-foreground">{patch.asset}</span>
                                                    </div>
                                                    <code className="bg-black/40 p-2 rounded text-accent font-mono text-[10px]">
                                                        {patch.patch_command}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* IOCs */}
                                {content.technical_report.ioc_summary && content.technical_report.ioc_summary.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                            <AlertTriangle className="w-3 h-3" /> Indicators of Compromise
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {content.technical_report.ioc_summary.map((ioc, i) => (
                                                <div key={i} className="p-2 px-3 rounded-lg bg-red-500/5 border border-red-500/10 text-[11px] flex items-center justify-between">
                                                    <span className="font-mono text-red-300">{ioc.value}</span>
                                                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">{ioc.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* 3. Compliance & Risk */}
                        {content?.compliance_report && (
                            <section className="space-y-4">
                                <SectionHeader icon={List} title="Compliance & Governance" />
                                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium">Compliance Score</span>
                                        <span className="text-xl font-bold text-accent">{content.compliance_report.overall_compliance_score}%</span>
                                    </div>
                                    <div className="space-y-3">
                                        {content.compliance_report.controls_violated?.map((v, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex gap-2 items-center text-xs font-bold text-orange-400">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    <span>{v.control_id}: {v.control_name}</span>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground pl-5">{v.finding}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border bg-background/50 flex gap-3">
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

function SectionHeader({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Icon className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
        </div>
    )
}

function MetricCard({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="p-3 rounded-xl bg-secondary/20 border border-border/50 text-center space-y-0.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
            <p className={`text-lg font-black ${color}`}>{value}</p>
        </div>
    )
}
