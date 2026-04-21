'use client'

import type { Report } from '@/types/report'

interface ReportCardProps {
    report: Report
    isSelected: boolean
    onSelect: (id: string) => void
}

export function ReportCard({ report, isSelected, onSelect }: ReportCardProps) {
    const getStatusColor = (status: string) => {
        return status === 'completed'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-blue-500/20 text-blue-400'
    }

    return (
        <button
            onClick={() => onSelect(report.id)}
            className={`w-full text-left p-6 border rounded-lg transition-all hover:border-accent ${isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-secondary/50'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                    <p className="text-xs text-muted-foreground">{report.description ?? '—'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(report.status)}`}>
                    {report.status}
                </span>
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
        </button>
    )
}
