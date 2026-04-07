'use client'

import { useState } from 'react'
import { incidents, playbooks } from '@/lib/mock-data'
import { Clock, Zap, Play } from 'lucide-react'

export default function IncidentResponsePage() {
    const [selectedIncident, setSelectedIncident] = useState(incidents[0])
    const [activePlaybook, setActivePlaybook] = useState<string | null>(null)

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-destructive/20 text-destructive'
            case 'high':
                return 'bg-yellow-500/20 text-yellow-400'
            default:
                return 'bg-blue-500/20 text-blue-400'
        }
    }

    const getStatusColor = (status: string) => {
        return status === 'resolved'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-orange-500/20 text-orange-400'
    }

    return (
        <div className="p-8 space-y-8">
            {/* Page Title */}
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Incident Response</h2>
                <p className="text-muted-foreground">Manage active incidents and playbook execution</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Incidents List */}
                <div className="lg:col-span-1">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Active Incidents</h3>
                        <div className="space-y-3">
                            {incidents.map((incident) => (
                                <button
                                    key={incident.id}
                                    onClick={() => setSelectedIncident(incident)}
                                    className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedIncident.id === incident.id
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
                </div>

                {/* Incident Details */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                        {/* Header */}
                        <div className="border-b border-border pb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">{selectedIncident.title}</h3>
                                    <p className="text-sm text-muted-foreground font-mono">{selectedIncident.id}</p>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedIncident.status)}`}>
                                    {selectedIncident.status === 'resolved' ? 'Resolved' : 'In Progress'}
                                </span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Timeline
                            </h4>
                            <div className="space-y-3">
                                <div className="flex gap-4">
                                    <div className="text-sm text-muted-foreground min-w-32">Created</div>
                                    <div className="text-sm text-foreground">{selectedIncident.created}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-sm text-muted-foreground min-w-32">Last Updated</div>
                                    <div className="text-sm text-foreground">{selectedIncident.updated}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-sm text-muted-foreground min-w-32">Assigned To</div>
                                    <div className="text-sm text-foreground font-medium">{selectedIncident.assignee}</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3 border-t border-border pt-6">
                            <h4 className="font-semibold text-foreground">Description</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {selectedIncident.description}
                            </p>
                        </div>

                        {/* Severity and Details */}
                        <div className="grid grid-cols-3 gap-4 border-t border-border pt-6">
                            <div className="bg-secondary/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">Severity</p>
                                <p className={`font-semibold ${selectedIncident.severity === 'critical' ? 'text-destructive' : 'text-yellow-400'
                                    }`}>
                                    {selectedIncident.severity.toUpperCase()}
                                </p>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <p className={`font-semibold ${selectedIncident.status === 'resolved' ? 'text-green-400' : 'text-orange-400'
                                    }`}>
                                    {selectedIncident.status === 'resolved' ? 'RESOLVED' : 'ACTIVE'}
                                </p>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-4">
                                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                <p className="font-semibold text-foreground">~45 min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Playbooks */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Recommended Playbooks
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {playbooks.map((playbook) => (
                        <div
                            key={playbook.id}
                            className={`p-4 border rounded-lg transition-all cursor-pointer ${activePlaybook === playbook.id
                                    ? 'bg-primary/20 border-primary'
                                    : 'bg-secondary/50 border-border hover:border-accent'
                                }`}
                            onClick={() => setActivePlaybook(activePlaybook === playbook.id ? null : playbook.id)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <p className="text-xs text-accent font-medium mb-1">{playbook.category}</p>
                                    <h4 className="font-semibold text-foreground text-sm">{playbook.title}</h4>
                                </div>
                                <Play className="w-4 h-4 text-accent shrink-0" />
                            </div>

                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                {playbook.description}
                            </p>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{playbook.steps} steps</span>
                                {activePlaybook === playbook.id && (
                                    <button className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90 transition-opacity">
                                        Execute
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Playbook Execution */}
            {activePlaybook && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                        Playbook Execution: {playbooks.find(p => p.id === activePlaybook)?.title}
                    </h3>

                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg border border-border"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold shrink-0">
                                    {step}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground mb-1">Step {step}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Execute automated response actions...
                                    </p>
                                </div>
                                <button className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm font-medium hover:bg-accent/30 transition-colors shrink-0">
                                    {step === 1 ? 'In Progress' : 'Pending'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
