'use client'

import type { Report } from '@/types/report'
import { Download, Trash2 } from 'lucide-react'
import { exportToPDF } from '@/lib/export-utils'

interface ReportCardProps {
    report: Report
    onSelect: (report: Report) => void
    onDelete: (id: string) => void
}

export function ReportCard({ report, onSelect, onDelete }: ReportCardProps) {
    const getStatusColor = (status: string) => {
        return status === 'completed'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-emerald-500/20 text-emerald-400'
    }

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
            className="w-full text-left p-6 border rounded-lg bg-card border-border cursor-pointer hover:border-accent hover:bg-secondary/30 transition-all"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="pr-4">
                    <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                    <p className="text-xs text-muted-foreground">{report.description ?? '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(report.status)}`}>
                        {report.status}
                    </span>
                    <div 
                        role="button"
                        tabIndex={0}
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        title="Download PDF"
                    >
                        <Download className="w-4 h-4" />
                    </div>
                    <div 
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(report.id)
                        }}
                        className="p-1.5 hover:bg-red-500/20 rounded-md text-muted-foreground hover:text-red-400 transition-colors"
                        title="Delete Report"
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="text-foreground font-medium">{report.type}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="text-foreground font-medium">{report.date ?? '—'}</p>
                </div>
                <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="text-foreground font-medium">{report.size ?? '—'}</p>
                </div>
            </div>
        </div>
    )
}

