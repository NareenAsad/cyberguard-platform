'use client'
import { Clock, Download } from 'lucide-react'
import type { Incident } from '@/types/incident'
import { exportToPDF } from '@/lib/export-utils'

interface IncidentDetailsProps {
    incident: Incident | null
}

export function IncidentDetails({ incident }: IncidentDetailsProps) {
    if (!incident) return null

    const getStatusColor = (status: string) => {
        return status === 'resolved'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-orange-500/20 text-orange-400'
    }

    const handleDownload = () => {
        exportToPDF(
            `Incident Report: ${incident.title}`,
            [incident],
            [
                { header: 'ID', dataKey: 'id' },
                { header: 'Title', dataKey: 'title' },
                { header: 'Status', dataKey: 'status' },
                { header: 'Severity', dataKey: 'severity' },
                { header: 'Created', dataKey: 'created' },
                { header: 'Updated', dataKey: 'updated' },
                { header: 'Description', dataKey: 'description' },
            ],
            `Incident-${incident.id}`
        )
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="border-b border-border pb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{incident.title}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{incident.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {incident.status && (
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(incident.status)}`}>
                                {incident.status === 'resolved' ? 'Resolved' : 'In Progress'}
                            </span>
                        )}
                        <button
                            onClick={handleDownload}
                            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition-opacity"
                            title="Download PDF"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timeline
                </h4>
                <div className="space-y-3">
                    <div className="flex gap-4">
                        <div className="text-sm text-muted-foreground min-w-32">Created</div>
                        <div className="text-sm text-foreground">{incident.created ?? '—'}</div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-sm text-muted-foreground min-w-32">Last Updated</div>
                        <div className="text-sm text-foreground">{incident.updated ?? '—'}</div>
                    </div>
                </div>
            </div>
            <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-foreground">{incident.description}</p>
            </div>
        </div>
    )
}