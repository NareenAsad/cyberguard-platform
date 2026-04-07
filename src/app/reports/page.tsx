'use client'

import { useState } from 'react'
import { reports } from '@/lib/mock-data'
import { Download, Plus, Calendar, Filter } from 'lucide-react'

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const reportTypes = Array.from(new Set(reports.map(r => r.type)))

    const filteredReports = selectedType
        ? reports.filter(r => r.type === selectedType)
        : reports

    const currentReport = reports.find(r => r.id === selectedReport)

    const getStatusColor = (status: string) => {
        return status === 'completed'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-blue-500/20 text-blue-400'
    }

    return (
        <div className="p-8 space-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Security Reports</h2>
                    <p className="text-muted-foreground">Generated compliance and security analysis reports</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                    <Plus className="w-5 h-5" />
                    Generate Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters */}
                <div className="bg-card border border-border rounded-lg p-6 h-fit space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-accent" />
                        <h3 className="font-semibold text-foreground">Filters</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium block">Report Type</label>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedType(null)}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${selectedType === null
                                        ? 'bg-primary/20 text-primary border border-primary'
                                        : 'text-muted-foreground hover:bg-secondary'
                                    }`}
                            >
                                All Reports
                            </button>
                            {reportTypes.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${selectedType === type
                                            ? 'bg-primary/20 text-primary border border-primary'
                                            : 'text-muted-foreground hover:bg-secondary'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2 pt-4 border-t border-border">
                        <label className="text-xs text-muted-foreground font-medium block">Date Range</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                </div>

                {/* Reports List */}
                <div className="lg:col-span-3">
                    <div className="space-y-4">
                        {filteredReports.map((report) => (
                            <button
                                key={report.id}
                                onClick={() => setSelectedReport(report.id)}
                                className={`w-full text-left p-6 border rounded-lg transition-all hover:border-accent ${selectedReport === report.id
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-card border-border hover:bg-secondary/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-foreground mb-1 text-lg">{report.title}</h3>
                                        <p className="text-sm text-muted-foreground">{report.id}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                        </span>
                                        <span className="px-3 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                                            {report.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Generated: {report.generated}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span>Threats Found: {report.threats}</span>
                                        <span>Resolved: {report.resolved}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Report Preview */}
            {selectedReport && currentReport && (
                <div className="bg-card border border-border rounded-lg p-8 space-y-8">
                    {/* Header */}
                    <div className="border-b border-border pb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">{currentReport.title}</h3>
                                <p className="text-sm text-muted-foreground">{currentReport.id}</p>
                            </div>
                            <button className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                                <Download className="w-5 h-5" />
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Report Details */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Report Type</p>
                            <p className="font-semibold text-foreground">{currentReport.type}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Generated</p>
                            <p className="font-semibold text-foreground">{currentReport.generated}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Threats Detected</p>
                            <p className="font-semibold text-yellow-400 text-lg">{currentReport.threats}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Resolved</p>
                            <p className="font-semibold text-green-400 text-lg">{currentReport.resolved}</p>
                        </div>
                    </div>

                    {/* Report Sections */}
                    <div className="space-y-6">
                        {/* Executive Summary */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-foreground text-lg">Executive Summary</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                This report provides a comprehensive analysis of security incidents and threats detected during the reporting period. A total of {currentReport.threats} threats were identified across the monitored infrastructure, with {currentReport.resolved} successfully resolved. The organization maintained an average system uptime of 99.99% while implementing multiple security enhancements and patches.
                            </p>
                        </div>

                        {/* Key Findings */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-foreground text-lg">Key Findings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Critical Incidents', value: '3', color: 'text-destructive' },
                                    { title: 'High Priority Issues', value: '12', color: 'text-yellow-400' },
                                    { title: 'Detection Rate', value: '94%', color: 'text-green-400' },
                                    { title: 'Avg Response Time', value: '2.1m', color: 'text-blue-400' },
                                ].map((finding, index) => (
                                    <div key={index} className="bg-secondary/50 rounded-lg p-4 border border-border">
                                        <p className="text-xs text-muted-foreground mb-1">{finding.title}</p>
                                        <p className={`font-bold text-2xl ${finding.color}`}>{finding.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-foreground text-lg">Recommendations</h4>
                            <div className="space-y-2">
                                {[
                                    'Implement additional email security measures and DMARC configuration',
                                    'Deploy intrusion prevention systems on all network borders',
                                    'Establish formal patch management process with 30-day SLA',
                                    'Conduct security awareness training for all staff members',
                                    'Review and update incident response procedures quarterly',
                                ].map((recommendation, index) => (
                                    <div key={index} className="flex gap-3 p-3 bg-secondary/30 rounded-lg">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-border text-xs text-muted-foreground space-y-1">
                        <p>Report generated on {currentReport.generated}</p>
                        <p>File: {currentReport.download}</p>
                        <p>Classification: Internal Use Only</p>
                    </div>
                </div>
            )}
        </div>
    )
}
