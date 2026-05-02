'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, Server, Monitor, Database, Globe, Cpu } from 'lucide-react'

interface Asset { id: string; name: string; type: string; ip_address: string | null; os: string | null; status: string; owner: string | null; last_seen: string }

const TYPE_ICONS: Record<string, any> = {
    server: Server, workstation: Monitor, database: Database, network: Globe, cloud: Cpu,
}
const STATUS_COLORS: Record<string, string> = {
    active:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    'at-risk': 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    offline: 'text-slate-400 bg-slate-700/30 border-slate-600/25',
}

const ASSET_TYPES = ['server', 'workstation', 'database', 'network', 'cloud']
const ASSET_STATUSES = ['active', 'at-risk', 'offline']

const BLANK = { name: '', type: 'server', ip_address: '', os: '', status: 'active', owner: '' }

export default function AssetsTab() {
    const [assets,  setAssets]  = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState(BLANK)
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/admin/assets')
        const json = await res.json()
        setAssets(json.assets || [])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    async function addAsset() {
        if (!form.name) return
        setSaving(true)
        const res = await fetch('/api/admin/assets', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
        const json = await res.json()
        if (json.asset) { setAssets(a => [json.asset, ...a]); setForm(BLANK); setShowForm(false) }
        setSaving(false)
    }

    async function deleteAsset(id: string) {
        setDeleting(id)
        await fetch(`/api/admin/assets?id=${id}`, { method: 'DELETE' })
        setAssets(a => a.filter(x => x.id !== id))
        setDeleting(null)
    }

    const stats = { total: assets.length, active: assets.filter(a => a.status === 'active').length, atRisk: assets.filter(a => a.status === 'at-risk').length, offline: assets.filter(a => a.status === 'offline').length }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3">
                    {[
                        { label: 'Total',    val: stats.total,   color: 'text-slate-200'  },
                        { label: 'Active',   val: stats.active,  color: 'text-emerald-400'},
                        { label: 'At Risk',  val: stats.atRisk,  color: 'text-amber-400'  },
                        { label: 'Offline',  val: stats.offline, color: 'text-slate-500'  },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-2.5 text-center min-w-[64px]">
                            <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                            <p className="text-[10px] text-slate-500">{s.label}</p>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                    <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
                        <Plus className="w-4 h-4" /> Add Asset
                    </button>
                </div>
            </div>

            {/* Add Asset Form */}
            {showForm && (
                <div className="rounded-2xl border border-purple-500/30 bg-purple-600/5 p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-100">New Asset</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                            { key: 'name', label: 'Name *', placeholder: 'Web Server 01' },
                            { key: 'ip_address', label: 'IP Address', placeholder: '192.168.1.10' },
                            { key: 'os', label: 'OS', placeholder: 'Ubuntu 22.04' },
                            { key: 'owner', label: 'Owner', placeholder: 'Security Team' },
                        ].map(f => (
                            <div key={f.key} className="space-y-1">
                                <label className="text-[11px] uppercase tracking-wider text-slate-500">{f.label}</label>
                                <input value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/60" />
                            </div>
                        ))}
                        <div className="space-y-1">
                            <label className="text-[11px] uppercase tracking-wider text-slate-500">Type</label>
                            <select value={form.type} onChange={e => setForm(x => ({ ...x, type: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm focus:outline-none">
                                {ASSET_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[11px] uppercase tracking-wider text-slate-500">Status</label>
                            <select value={form.status} onChange={e => setForm(x => ({ ...x, status: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm focus:outline-none">
                                {ASSET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={addAsset} disabled={saving || !form.name}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium transition-colors">
                            {saving ? 'Adding…' : 'Add Asset'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-700/50 text-slate-400 hover:text-slate-200 text-sm transition-colors">Cancel</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-800/40">
                                {['Asset', 'Type', 'IP Address', 'OS', 'Status', 'Last Seen', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="px-4 py-4">
                                        <div className="h-7 rounded-lg bg-slate-800/60 animate-pulse" />
                                    </td></tr>
                                ))
                            ) : assets.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">No assets yet — add one above</td></tr>
                            ) : assets.map(a => {
                                const Icon = TYPE_ICONS[a.type] || Server
                                return (
                                    <tr key={a.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-200 font-medium text-sm">{a.name}</p>
                                                    {a.owner && <p className="text-xs text-slate-500">{a.owner}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs capitalize">{a.type}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs font-mono">{a.ip_address || '—'}</td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">{a.os || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[a.status] || STATUS_COLORS.offline}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">
                                            {new Date(a.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => deleteAsset(a.id)} disabled={deleting === a.id}
                                                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
