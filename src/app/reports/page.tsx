'use client'

import { useState } from 'react'
import { reports } from '@/lib/mock-data'
import { Plus } from 'lucide-react'
import { ReportFilters } from '@/components/reports/report-filters'
import { ReportsList } from '@/components/reports/reports-list'

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const reportTypes = Array.from(new Set(reports.map(r => r.type)))

    const filteredReports = selectedType
        ? reports.filter(r => r.type === selectedType)
        : reports

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Security Reports</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Generated compliance and security analysis reports</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                    <Plus className="w-5 h-5" />
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <ReportFilters
                    reportTypes={reportTypes}
                    selectedType={selectedType}
                    onSelectType={setSelectedType}
                />
                <ReportsList
                    reports={filteredReports}
                    selectedReport={selectedReport}
                    onSelectReport={setSelectedReport}
                />
            </div>
        </div>
    )
}
