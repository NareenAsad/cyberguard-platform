'use client'

import { useEffect } from 'react'
import { X, FileText, Download, CheckCircle, Clock } from 'lucide-react'
import type { Report } from '@/types/report'
import { exportToPDF } from '@/lib/export-utils'

interface ReportDetailPanelProps {
    report: Report | null
    onClose: () => void
}

export function ReportDetailPanel({ report, onClose }: ReportDetailPanelProps) {
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

    const isCompleted = report?.status === 'completed'

    const handleDownload = () => {
        if (!report) return
        exportToPDF(
            report.title,
            [report],
            [
                { header: 'ID', dataKey: 'id' },
                { header: 'Type', dataKey: 'type' },
                { header: 'Status', dataKey: 'status' },
                { header: 'Date', dataKey: 'date' },
                { header: 'Description', dataKey: 'description' },
            ],
            `Report-${report.id}`
        )
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
                <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col">

                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-border">
                        <div className="flex items-start gap-3 pr-4">
                            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {report?.status}
                                    </span>
                                    <span className="text-xs text-muted-foreground/50">{report?.type}</span>
                                </div>
                                <h2 className="text-base font-bold text-foreground leading-snug">{report?.title}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 px-6 py-2.5 bg-secondary/10 border-b border-border text-xs text-muted-foreground">
                        <span className="font-mono text-foreground/50">{report?.id}</span>
                        {report?.date && (
                            <>
                                <span>·</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{report.date}</span>
                            </>
                        )}
                        {report?.size && (
                            <>
                                <span>·</span>
                                <span>{report.size}</span>
                            </>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {report?.description && (
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</p>
                                <p className="text-sm text-foreground/80 leading-relaxed">{report.description}</p>
                            </div>
                        )}

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-1">
                                <p className="text-xs text-muted-foreground">Type</p>
                                <p className="text-sm font-semibold text-foreground">{report?.type ?? '—'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-1">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <div className="flex items-center gap-1.5">
                                    {isCompleted
                                        ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                        : <Clock className="w-3.5 h-3.5 text-blue-400" />
                                    }
                                    <p className={`text-sm font-semibold capitalize ${isCompleted ? 'text-green-400' : 'text-blue-400'}`}>
                                        {report?.status ?? '—'}
                                    </p>
                                </div>
                            </div>
                            {report?.threats !== undefined && (
                                <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-1">
                                    <p className="text-xs text-muted-foreground">Threats Detected</p>
                                    <p className="text-sm font-semibold text-foreground">{report.threats}</p>
                                </div>
                            )}
                            {report?.resolved !== undefined && (
                                <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-1">
                                    <p className="text-xs text-muted-foreground">Resolved</p>
                                    <p className="text-sm font-semibold text-green-400">{report.resolved}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
