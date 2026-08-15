'use client'

import { useState } from 'react'
import { Clock, Trash2, User, CheckCircle, RefreshCw, AlertCircle, UserCheck } from 'lucide-react'
import type { Incident } from '@/types/incident'
import { incidentAPI } from '@/lib/api-service'
import { useAuth } from '@/lib/auth/auth-context'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'

interface IncidentDetailsProps {
    incident: Incident | null
    onUpdate?: (updated: Incident) => void
    onDelete?: (id: string) => void
}

const STATUS_OPTIONS = [
    { value: 'open', label: 'Open', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
    { value: 'in-progress', label: 'In Progress', color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
    { value: 'resolved', label: 'Resolved', color: 'text-accent bg-accent/15 border-accent/30' },
]

const ASSIGNEE_OPTIONS = [
    'Unassigned',
    'Ana (Administrator)',
    'SOC Team',
    'IT Admin',
    'Security Analyst',
    'Network Team',
    'Incident Response Team',
]

export function IncidentDetails({ incident, onUpdate, onDelete }: IncidentDetailsProps) {
    const { can } = useAuth()
    const [saving, setSaving] = useState(false)
    const [localAssignee, setLocalAssignee] = useState<string | null>(null)
    const [localStatus, setLocalStatus] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState('')

    if (!incident) {
        return (
            <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-muted-foreground text-sm">Select an incident to view details and manage assignment</p>
            </div>
        )
    }

    const currentAssignee = localAssignee ?? incident.assignee ?? 'Unassigned'
    const currentStatus = localStatus ?? incident.status ?? 'open'

    const statusStyle = STATUS_OPTIONS.find(s => s.value === currentStatus)?.color
        ?? 'text-muted-foreground bg-secondary border-border'
    const statusLabel = STATUS_OPTIONS.find(s => s.value === currentStatus)?.label ?? currentStatus

    const handleSave = async () => {
        setSaving(true)
        setSuccessMsg('')
        try {
            const updates: { assignee?: string; status?: string } = {}
            if (localAssignee !== null) updates.assignee = localAssignee === 'Unassigned' ? '' : localAssignee
            if (localStatus !== null) updates.status = localStatus

            const result = await incidentAPI.updateIncident(incident.id, updates)
            if (result.success) {
                setSuccessMsg('Saved successfully')
                onUpdate?.({ ...incident, ...updates })
                setTimeout(() => setSuccessMsg(''), 3000)
                setLocalAssignee(null)
                setLocalStatus(null)
            }
        } catch (e) {
            console.error('Failed to update incident:', e)
        } finally {
            setSaving(false)
        }
    }

    const isDirty = localAssignee !== null || localStatus !== null

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Primary top bar */}
            <div className="h-0.5 bg-gradient-to-r from-primary via-primary/40 to-transparent" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border capitalize ${statusStyle}`}>
                                {statusLabel}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border capitalize ${
                                incident.severity === 'critical'
                                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                                    : incident.severity === 'high'
                                    ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                                    : 'bg-accent/15 text-accent border-accent/30'
                            }`}>
                                {incident.severity}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground leading-snug">{incident.title}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{incident.incidentId ?? incident.id}</p>
                    </div>
                    {can('canDeleteData') && (
                        <DeleteConfirmDialog itemLabel="incident" onConfirm={() => onDelete?.(incident.id)}>
                            <button
                                className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors shrink-0"
                                title="Delete Incident"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </DeleteConfirmDialog>
                    )}
                </div>

                {/* ── Assignment & Status Controls ──────────────────── */}
                {can('canAssignIncidents') && (
                    <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="w-4 h-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">Assignment &amp; Status</h4>
                            {successMsg && (
                                <span className="ml-auto text-xs text-accent flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {successMsg}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Assignee */}
                            <div>
                                <label className="text-xs text-muted-foreground font-medium block mb-1.5 flex items-center gap-1">
                                    <User className="w-3 h-3" /> Assigned To
                                </label>
                                <select
                                    value={localAssignee ?? currentAssignee}
                                    onChange={(e) => setLocalAssignee(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                >
                                    {ASSIGNEE_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-xs text-muted-foreground font-medium block mb-1.5 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> Status
                                </label>
                                <select
                                    value={localStatus ?? currentStatus}
                                    onChange={(e) => setLocalStatus(e.target.value)}
                                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Save button — only visible if changes made */}
                        {isDirty && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary/90 text-slate-950 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-3.5 h-3.5" /> Save Changes
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Timeline
                    </h4>
                    <div className="space-y-2 pl-1">
                        <div className="flex gap-4 text-sm">
                            <div className="text-muted-foreground min-w-28 text-xs">Created</div>
                            <div className="text-foreground text-xs">{incident.created ?? '—'}</div>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="text-muted-foreground min-w-28 text-xs">Last Updated</div>
                            <div className="text-foreground text-xs">{incident.updated ?? '—'}</div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">Description</p>
                    <p className="text-foreground text-sm leading-relaxed">{incident.description}</p>
                </div>
            </div>
        </div>
    )
}