'use client'

import { useState, useEffect } from 'react'
import type { Report } from '@/types/report'
import { Plus } from 'lucide-react'
import { ReportFilters } from '@/components/reports/report-filters'
import { ReportsList } from '@/components/reports/reports-list'
import { GenerateReportModal } from '@/components/reports/generate-report-modal'
import { reportsAPI } from '@/lib/api-service'

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [selectedType, setSelectedType] = useState<string | null>(null)
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)

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

    const handleReportCreated = (newReport: Report) => {
        setReports(prev => [newReport, ...prev])
    }

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
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    Generate Report
                </button>
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
                        selectedReport={selectedReport}
                        onSelectReport={setSelectedReport}
                    />
                </div>
            )}

            <GenerateReportModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={handleReportCreated}
            />
        </div>
    )
}
