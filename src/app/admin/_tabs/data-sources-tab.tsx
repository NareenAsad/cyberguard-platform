'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff, Save, RefreshCw, CheckCircle2, AlertCircle, Shield, Search, Globe, Bug, Link } from 'lucide-react'

interface DataSource { id: string; key: string; name: string; enabled: boolean; updated_at: string }

const SOURCE_META: Record<string, { icon: any; desc: string; color: string }> = {
    otx:        { icon: Shield, desc: 'AlienVault Open Threat Exchange — IP/domain reputation', color: 'blue'   },
    nvd:        { icon: Search, desc: 'NIST National Vulnerability Database — CVE data',         color: 'emerald'},
    shodan:     { icon: Globe,  desc: 'Internet-wide device and service scanning',                color: 'amber'  },
    virustotal: { icon: Bug,    desc: 'File and URL malware scanning',                            color: 'red'    },
}

export default function DataSourcesTab() {
    const [sources, setSources]   = useState<DataSource[]>([])
    const [apiKeys, setApiKeys]   = useState<Record<string, string>>({})
    const [showKey, setShowKey]   = useState<Record<string, boolean>>({})
    const [saving,  setSaving]    = useState<string | null>(null)
    const [feedback, setFeedback] = useState<Record<string, 'ok' | 'err'>>({})
    const [loading, setLoading]   = useState(true)

    const load = useCallback(async () => {
        setLoading(true)
        const res = await fetch('/api/admin/data-sources')
        const json = await res.json()
        setSources(json.sources || [])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    async function save(key: string, patch: { api_key?: string; enabled?: boolean }) {
        setSaving(key)
        const res = await fetch('/api/admin/data-sources', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, ...patch }),
        })
        setFeedback(f => ({ ...f, [key]: res.ok ? 'ok' : 'err' }))
        setTimeout(() => setFeedback(f => { const c = { ...f }; delete c[key]; return c }), 3000)
        if (res.ok && patch.enabled !== undefined) {
            setSources(s => s.map(x => x.key === key ? { ...x, enabled: patch.enabled! } : x))
        }
        setSaving(null)
    }

    const colorsMap: Record<string, string> = {
        blue: 'border-primary/40 bg-primary/8', cyan: 'border-primary/40 bg-primary/8',
        amber: 'border-amber-500/40 bg-amber-600/8', red: 'border-red-500/40 bg-red-600/8',
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Configure external threat intelligence sources</p>
                <button onClick={load} className="p-2 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-slate-800/40 animate-pulse" />)}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {sources.map(src => {
                        const meta = SOURCE_META[src.key] || { icon: Link, desc: src.name, color: 'blue' }
                        return (
                            <div key={src.key} className={`rounded-2xl border bg-slate-900/60 p-5 space-y-4 transition-all ${
                                src.enabled ? colorsMap[meta.color] || colorsMap.blue : 'border-slate-700/40'
                            }`}>
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/50">
                                            <meta.icon className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{src.name}</p>
                                            <p className="text-xs text-slate-500 mt-0.5 max-w-[200px]">{meta.desc}</p>
                                        </div>
                                    </div>
                                    {/* Toggle */}
                                    <button onClick={() => save(src.key, { enabled: !src.enabled })}
                                        disabled={saving === src.key}
                                        className={`relative w-11 h-6 rounded-full transition-all duration-300 ${src.enabled ? 'bg-primary' : 'bg-slate-700'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${src.enabled ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>

                                {/* API Key input */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">API Key</label>
                                    <div className="relative">
                                        <input
                                            type={showKey[src.key] ? 'text' : 'password'}
                                            placeholder="Enter API key…"
                                            value={apiKeys[src.key] || ''}
                                            onChange={e => setApiKeys(k => ({ ...k, [src.key]: e.target.value }))}
                                            className="w-full pr-10 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-primary/60 transition-all"
                                        />
                                        <button type="button"
                                            onClick={() => setShowKey(s => ({ ...s, [src.key]: !s[src.key] }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                            {showKey[src.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Save + feedback */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => save(src.key, { api_key: apiKeys[src.key] })}
                                        disabled={saving === src.key || !apiKeys[src.key]}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary disabled:opacity-40 text-white text-xs font-medium transition-colors">
                                        <Save className="w-3.5 h-3.5" /> Save Key
                                    </button>
                                    {feedback[src.key] === 'ok'  && <span className="flex items-center gap-1 text-xs text-primary"><CheckCircle2 className="w-3.5 h-3.5" /> Saved</span>}
                                    {feedback[src.key] === 'err' && <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

