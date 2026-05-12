'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface Incident {
    id: string
    title: string
    severity: string
    description: string
    assignee: string
    status: string
}

interface RecentIncidentsProps {
    incidents?: Incident[]
    loading?: boolean
}

export function RecentIncidents({ incidents = [], loading }: RecentIncidentsProps) {
    const displayIncidents = incidents || []

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Recent Incidents</h3>

            <div className="space-y-4">
                {loading ? (
                    <>{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</>
                ) : displayIncidents.length > 0 ? (
                    displayIncidents.map((incident) => (
                        <div key={incident.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-semibold text-foreground">{incident.title}</h4>
                                    <p className="text-sm text-muted-foreground">{incident.id}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${incident.severity === 'critical'
                                        ? 'bg-destructive/20 text-destructive'
                                        : incident.severity === 'high'
                                            ? 'bg-yellow-500/20 text-yellow-400'
                                            : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{incident.description}</p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">{incident.assignee}</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${incident.status === 'resolved'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-orange-500/20 text-orange-400'
                                    }`}>
                                    {incident.status === 'resolved' ? 'Resolved' : 'In Progress'}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-8">No incidents found</p>
                )}
            </div>
        </div>
    )
}

