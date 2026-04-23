'use client'

import { useState } from 'react'
import { X, FileText, Loader2, CheckCircle } from 'lucide-react'
import { reportsAPI } from '@/lib/api-service'
import type { Report } from '@/types/report'

const REPORT_TYPES = [
    { value: 'executive', label: 'Executive Summary', description: 'High-level security posture overview for leadership' },
    { value: 'technical', label: 'Technical Threat Intelligence', description: 'In-depth analysis of detected threats and IOCs' },
    { value: 'compliance', label: 'Compliance Report', description: 'ISO 27001 / NIST / SOC 2 audit-ready report' },
]

interface GenerateReportModalProps {
    open: boolean
    onClose: () => void
    onCreated: (report: Report) => void
}

export function GenerateReportModal({ open, onClose, onCreated }: GenerateReportModalProps) {
    const [form, setForm] = useState({
        title: '',
        type: REPORT_TYPES[0].value,
        description: '',
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!open) return null

    const selectedType = REPORT_TYPES.find(t => t.value === form.type)!

    // Auto-fill title when type changes
    const handleTypeChange = (type: string) => {
        const preset = REPORT_TYPES.find(t => t.value === type)!
        setForm(f => ({
            ...f,
            type,
            title: f.title || `${preset.label} - ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!form.title.trim()) {
            setError('Please provide a report title.')
            return
        }

        setLoading(true)
        try {
            const result = await reportsAPI.createReport({
                title: form.title.trim(),
                type: form.type,
                description: form.description.trim() || selectedType.description,
            })

            if (result.success) {
                setSuccess(true)
                onCreated(result.data)
                // Auto-close after 1.5s
                setTimeout(() => {
                    setSuccess(false)
                    setForm({ title: '', type: REPORT_TYPES[0].value, description: '' })
                    onClose()
                }, 1500)
            } else {
                setError(result.error || 'Failed to generate report. Please try again.')
            }
        } catch {
            setError('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Generate Report</h2>
                            <p className="text-xs text-muted-foreground">Create a new security report and save to database</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success state */}
                {success ? (
                    <div className="p-10 flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-foreground">Report Generated!</p>
                            <p className="text-sm text-muted-foreground mt-1">Your report has been saved to the database.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Report Type <span className="text-destructive">*</span>
                            </label>
                            <select
                                value={form.type}
                                onChange={e => handleTypeChange(e.target.value)}
                                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            >
                                {REPORT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                            {/* Description hint below the dropdown */}
                            <p className="text-xs text-muted-foreground mt-1.5">{selectedType.description}</p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Report Title <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder={`e.g. ${selectedType.label} - ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
                                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                        </div>

                        {/* Description (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                                Description <span className="text-muted-foreground text-xs">(optional)</span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder={selectedType.description}
                                rows={2}
                                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate Report'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
