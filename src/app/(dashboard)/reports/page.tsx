'use client'

import { useState, useEffect } from 'react'
import type { Report } from '@/types/report'
import { ReportFilters } from '@/components/reports/report-filters'
import { ReportsList } from '@/components/reports/reports-list'
import { ReportDetailPanel } from '@/components/reports/report-detail-panel'
import { reportsAPI } from '@/lib/api-service'
import { usePageRefresh } from '@/hooks/use-page-refresh'

interface DateRange {
    from: string
    to: string
}

export default function ReportsPage() {
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState<DateRange>({ from: '', to: '' })
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)

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

    usePageRefresh('reports', fetchReports)

    useEffect(() => {
        fetchReports()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            const result = await reportsAPI.deleteReport(id)
            if (result.success) {
                setReports(prev => prev.filter(r => r.id !== id))
                if (selectedReport?.id === id) setSelectedReport(null)
            }
        } catch (error) {
            console.error("Failed to delete report:", error)
        }
    }

    const reportTypes = Array.from(new Set(reports.map(r => r.type)))

    const filteredReports = reports.filter((r) => {
        // Filter by type
        if (selectedType && r.type !== selectedType) return false

        // Filter by date range
        const reportDateStr = r.generated || r.date
        if (reportDateStr && (dateRange.from || dateRange.to)) {
            const reportDate = new Date(reportDateStr)
            if (dateRange.from) {
                const fromDate = new Date(dateRange.from)
                if (reportDate < fromDate) return false
            }
            if (dateRange.to) {
                // Include the full "to" day
                const toDate = new Date(dateRange.to)
                toDate.setHours(23, 59, 59, 999)
                if (reportDate > toDate) return false
            }
        }

        return true
    })

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Page Title */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Security Reports</h2>
                <p className="text-sm md:text-base text-muted-foreground">Generated compliance and security analysis reports</p>
            </div>

            {loading ? (
                <div className="flex items-center gap-3 text-muted-foreground p-8">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    Loading reports...
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <ReportFilters
                        reportTypes={reportTypes}
                        selectedType={selectedType}
                        onSelectType={setSelectedType}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                    />
                    <ReportsList
                        reports={filteredReports}
                        onSelect={setSelectedReport}
                        onDelete={handleDelete}
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
