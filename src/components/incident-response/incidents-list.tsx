'use client'

import type { Incident } from '@/types/incident'

interface IncidentsListProps {
    incidents: Incident[]
    selectedIncident: Incident | null
    onSelect: (incident: Incident) => void
}

export function IncidentsList({
    incidents,
    selectedIncident,
    onSelect,
}: IncidentsListProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-destructive/20 text-destructive'
            case 'high':
                return 'bg-yellow-500/20 text-yellow-400'
            default:
                return 'bg-emerald-500/20 text-emerald-400'
        }
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Active Incidents</h3>
            <div className="space-y-3">
                {incidents.map((incident) => (
                    <button
                        key={incident.id}
                        onClick={() => onSelect(incident)}
                        className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedIncident?.id === incident.id
                                ? 'bg-primary/20 border-primary'
                                : 'bg-secondary/50 border-border hover:bg-secondary'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-mono text-accent">{incident.id}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                                {incident.severity}
                            </span>
                        </div>
                        <p className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                            {incident.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {incident.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    )
}

