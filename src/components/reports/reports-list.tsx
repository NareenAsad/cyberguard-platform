'use client'

import { ReportCard } from './report-card'
import type { Report } from '@/types/report'

interface ReportsListProps {
    reports: Report[]
    selectedReport: string | null
    onSelectReport: (id: string) => void
}

export function ReportsList({
    reports,
    selectedReport,
    onSelectReport,
}: ReportsListProps) {
    return (
        <div className="lg:col-span-3">
            <div className="space-y-4">
                {reports.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        isSelected={selectedReport === report.id}
                        onSelect={onSelectReport}
                    />
                ))}
            </div>
        </div>
    )
}
