'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, Database, Wifi, Cpu, RefreshCw, Clock, User } from 'lucide-react'

interface AuditLog {
    id: string; action: string; user_email: string; target_type: string | null
    target_id: string | null; details: any; created_at: string
}

const ACTION_COLORS: Record<string, string> = {
    USER_SIGNIN:         'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    USER_SIGNUP:         'text-blue-400 bg-blue-500/10 border-blue-500/30',
    USER_SIGNOUT:        'text-slate-400 bg-slate-500/10 border-slate-500/30',
    PIPELINE_RUN:        'text-purple-400 bg-purple-500/10 border-purple-500/30',
    INCIDENT_CREATED:    'text-amber-400 bg-amber-500/10 border-amber-500/30',
    INCIDENT_UPDATED:    'text-blue-400 bg-blue-500/10 border-blue-500/30',
    INCIDENT_DELETED:    'text-red-400 bg-red-500/10 border-red-500/30',
    PLAYBOOK_CREATED:    'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    PLAYBOOK_DELETED:    'text-red-400 bg-red-500/10 border-red-500/30',
    REPORT_GENERATED:    'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    REPORT_DELETED:      'text-red-400 bg-red-500/10 border-red-500/30',
    ROLE_CHANGED:        'text-amber-400 bg-amber-500/10 border-amber-500/30',
    USER_DEACTIVATED:    'text-red-400 bg-red-500/10 border-red-500/30',
    USER_ACTIVATED:      'text-primary bg-primary/10 border-primary/30',
    DATA_SOURCE_UPDATED: 'text-primary bg-primary/10 border-primary/30',
    ASSET_CREATED:       'text-purple-400 bg-purple-500/10 border-purple-500/30',
    ASSET_DELETED:       'text-red-400 bg-red-500/10 border-red-500/30',
}

export default function SystemTab() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [health] = useState({
        database: 'healthy', aiAgent: 'healthy', socket: 'healthy', api: 'healthy',
    })

    const loadLogs = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/admin/audit-logs?limit=30')
        const json = await res.json()
        setLogs(json.logs || [])
        setLoading(false)
    }, [])

    useEffect(() => { loadLogs() }, [loadLogs])

    const statusCards = [
        { label: 'Database',   icon: Database, status: health.database,  detail: 'Supabase PostgreSQL' },
        { label: 'AI Agent',   icon: Cpu,      status: health.aiAgent,   detail: 'FastAPI / CrewAI'    },
        { label: 'Socket.io',  icon: Wifi,     status: health.socket,    detail: 'Real-time events'    },
        { label: 'API Routes', icon: Activity, status: health.api,       detail: 'Next.js server'      },
    ]

    return (
        <div className="space-y-5">
            {/* Health Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statusCards.map(s => {
                    const ok = s.status === 'healthy'
                    return (
                        <div key={s.label} className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
                                    <s.icon className="w-4 h-4 text-slate-400" />
                                </div>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                    ok ? 'text-primary bg-primary/10 border-primary/25'
                                       : 'text-red-400 bg-red-500/10 border-red-500/25'
                                }`}>
                                    {ok ? '● Healthy' : '● Down'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-200">{s.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{s.detail}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Audit Log */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-semibold text-slate-100">Audit Log</h2>
                        <span className="text-xs text-slate-500">Last 30 entries</span>
                    </div>
                    <button onClick={loadLogs} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-800/30">
                                {['Time', 'User', 'Action', 'Target', 'Details'].map(h => (
                                    <th key={h} className="px-4 py-2.5 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}><td colSpan={5} className="px-4 py-3">
                                        <div className="h-5 rounded bg-slate-800/60 animate-pulse" />
                                    </td></tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">No audit entries yet</td></tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3 h-3 text-slate-500" />
                                            <span className="text-xs text-slate-400 truncate max-w-[140px]">{log.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${ACTION_COLORS[log.action] || 'text-slate-400 bg-slate-700/30 border-slate-600/30'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {log.target_type && <span className="capitalize">{log.target_type}</span>}
                                        {log.target_id && <span className="ml-1 opacity-50 font-mono">{log.target_id.slice(0, 8)}…</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600 max-w-[180px] truncate">
                                        {log.details ? JSON.stringify(log.details) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

