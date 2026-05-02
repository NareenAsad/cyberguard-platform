'use client'

import { ReportCard } from './report-card'
import type { Report } from '@/types/report'

interface ReportsListProps {
    reports: Report[]
    onSelect: (report: Report) => void
}

export function ReportsList({ reports, onSelect }: ReportsListProps) {
    return (
        <div className="lg:col-span-3">
            <div className="space-y-4">
                {reports.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    )
}
