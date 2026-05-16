'use client'

import { ReportCard } from './report-card'
import type { Report } from '@/types/report'

interface ReportsListProps {
    reports: Report[]
    onSelect: (report: Report) => void
    onDelete: (id: string) => void
}

export function ReportsList({ reports, onSelect, onDelete }: ReportsListProps) {
    if (reports.length === 0) {
        return (
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-card border-border border-dashed">
                <h3 className="text-lg font-medium text-foreground mb-2">No Reports Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    There are no reports available. Wait for the AI agent to generate security reports, or check back later.
                </p>
            </div>
        )
    }

    return (
        <div className="lg:col-span-3">
            <div className="space-y-4">
                {reports.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        onSelect={onSelect}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    )
}
