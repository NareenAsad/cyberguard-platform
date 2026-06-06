'use client'

import type { Report } from '@/types/report'
import { Download, Trash2, FileText, Calendar, Shield, ChevronRight, BarChart3, Wrench, ClipboardList } from 'lucide-react'
import { exportToPDF } from '@/lib/export-utils'
import { useAuth } from '@/lib/auth/auth-context'

interface ReportCardProps {
    report: Report
    onSelect: (report: Report) => void
    onDelete: (id: string) => void
}

export function ReportCard({ report, onSelect, onDelete }: ReportCardProps) {
    const { can } = useAuth()
    
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'final':
                return 'bg-accent/20 text-accent border border-accent/40'
            case 'completed':
                return 'bg-accent/20 text-accent border border-accent/40'
            case 'draft':
                return 'bg-secondary text-muted-foreground border border-border'
            case 'pending':
                return 'bg-primary/20 text-primary border border-primary/40'
            default:
                return 'bg-secondary text-muted-foreground border border-border'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'executive': return BarChart3
            case 'technical': return Wrench
            case 'compliance': return ClipboardList
            default: return FileText
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch {
            return dateStr
        }
    }

    const displayDate = report.generated || report.date

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation()
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
        <div
            onClick={() => onSelect(report)}
            className="group w-full text-left border rounded-xl bg-card border-primary/20 cursor-pointer hover:border-primary/50 transition-all duration-200 overflow-hidden"
        >
            {/* Primary gradient top bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {(() => {
                            const IconComponent = getTypeIcon(report.type)
                            return (
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <IconComponent className="w-5 h-5 text-primary" />
                                </div>
                            )
                        })()}
                        <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                {report.title}
                            </h3>
                            {report.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {report.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyle(report.status)}`}>
                            {report.status}
                        </span>
                        {can('canExportData') && (
                            <button
                                onClick={handleDownload}
                                className="p-1.5 hover:bg-primary/10 rounded-md text-muted-foreground hover:text-primary transition-colors"
                                title="Download PDF"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {can('canDeleteData') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(report.id)
                                }}
                                className="p-1.5 hover:bg-red-500/10 rounded-md text-muted-foreground hover:text-red-400 transition-colors"
                                title="Delete Report"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mb-3" />

                {/* Meta Row */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Type badge */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border capitalize bg-primary/10 text-primary border-primary/25">
                        <Shield className="w-3 h-3" />
                        {report.type ?? '—'}
                    </span>

                    {/* Date */}
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 text-primary" />
                        {formatDate(displayDate)}
                    </span>

                    {/* Threats if available */}
                    {report.threats != null && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                            <FileText className="w-3 h-3" />
                            {report.threats} threats
                        </span>
                    )}

                    {/* Size */}
                    {report.size && (
                        <span className="text-xs text-muted-foreground">{report.size}</span>
                    )}

                    {/* View details */}
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        View details
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                </div>
            </div>
        </div>
    )
}
