'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, UserCheck, UserX, ChevronDown, RefreshCw, Plus } from 'lucide-react'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/auth/types'
import type { UserRole } from '@/lib/auth/types'

interface AdminUser {
    id: string; email: string; full_name: string | null
    role: UserRole; is_active: boolean; created_at: string; last_sign_in_at: string | null
}

const ROLE_COLORS: Record<UserRole, string> = {
    admin:   'text-red-400 bg-red-500/10 border-red-500/30',
    manager: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    analyst: 'text-primary bg-primary/10 border-primary/30',
}

export default function UsersTab() {
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/admin/users')
        const json = await res.json()
        setUsers(json.users || [])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    async function updateUser(id: string, patch: Partial<AdminUser>) {
        setSaving(id)
        await fetch(`/api/admin/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        })
        setUsers(u => u.map(x => x.id === id ? { ...x, ...patch } : x))
        setSaving(null)
    }

    const filtered = users.filter(u =>
        (u.email + (u.full_name || '')).toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search users…"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-primary/60" />
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary text-white text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Invite User
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total',    value: users.length, color: 'text-slate-200' },
                    { label: 'Active',   value: users.filter(u => u.is_active).length,  color: 'text-primary' },
                    { label: 'Admins',   value: users.filter(u => u.role === 'admin').length,   color: 'text-red-400' },
                    { label: 'Analysts', value: users.filter(u => u.role === 'analyst').length, color: 'text-primary' },
                ].map(s => (
                    <div key={s.label} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-800/40">
                                {['User', 'Role', 'Status', 'Joined', 'Last Login', 'Actions'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}><td colSpan={6} className="px-4 py-4">
                                        <div className="h-8 rounded-lg bg-slate-800/60 animate-pulse" />
                                    </td></tr>
                                ))
                            ) : filtered.map(u => (
                                <tr key={u.id} className={`hover:bg-slate-800/30 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                                    {/* User */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {(u.full_name || u.email).slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-slate-200 font-medium truncate">{u.full_name || '—'}</p>
                                                <p className="text-slate-500 text-xs truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Role */}
                                    <td className="px-4 py-3">
                                        <div className="relative">
                                            <select
                                                value={u.role}
                                                disabled={saving === u.id}
                                                onChange={e => updateUser(u.id, { role: e.target.value as UserRole })}
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border appearance-none cursor-pointer pr-6 ${ROLE_COLORS[u.role]} bg-transparent focus:outline-none`}
                                            >
                                                <option value="analyst">Security Analyst</option>
                                                <option value="manager">Security Manager</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                                        </div>
                                    </td>
                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                                            u.is_active
                                                ? 'text-primary bg-primary/10 border-primary/20'
                                                : 'text-slate-500 bg-slate-700/30 border-slate-600/30'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-primary/80' : 'bg-slate-500'}`} />
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    {/* Joined */}
                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    {/* Last Login */}
                                    <td className="px-4 py-3 text-slate-500 text-xs">
                                        {u.last_sign_in_at
                                            ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            : 'Never'}
                                    </td>
                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                                            disabled={saving === u.id}
                                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 ${
                                                u.is_active
                                                    ? 'text-red-400 border-red-500/20 bg-red-500/10 hover:bg-red-500/20'
                                                    : 'text-primary border-primary/20 bg-primary/10 hover:bg-primary/20'
                                            }`}
                                        >
                                            {u.is_active ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-500 text-sm">No users found</div>
                    )}
                </div>
            </div>
        </div>
    )
}

