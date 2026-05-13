'use client'

import { useState, useEffect } from 'react'
import type { Report } from '@/types/report'
import { ReportFilters } from '@/components/reports/report-filters'
import { ReportsList } from '@/components/reports/reports-list'
import { ReportDetailPanel } from '@/components/reports/report-detail-panel'
import { reportsAPI } from '@/lib/api-service'
import { usePageRefresh } from '@/hooks/use-page-refresh'

export default function ReportsPage() {
    usePageRefresh('reports')
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true)
            try {
                const data = await reportsAPI.getReports()
                if (data) {
                    setReports(data)
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const reportTypes = Array.from(new Set(reports.map(r => r.type)))

    const filteredReports = selectedType
        ? reports.filter(r => r.type === selectedType)
        : reports

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Page Title */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Security Reports</h2>
                <p className="text-sm md:text-base text-muted-foreground">Generated compliance and security analysis reports</p>
            </div>

            {loading ? (
                <div>Loading reports...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <ReportFilters
                        reportTypes={reportTypes}
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                    />
                    <ReportsList
                        reports={filteredReports}
                        onSelect={setSelectedReport}
                    />
                </div>
            )}

            <ReportDetailPanel
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    )
}
