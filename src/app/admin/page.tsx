'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { Users, Activity, Database, Server } from 'lucide-react'
import UsersTab from './_tabs/users-tab'
import SystemTab from './_tabs/system-tab'
import DataSourcesTab from './_tabs/data-sources-tab'
import AssetsTab from './_tabs/assets-tab'

const TABS = [
    { id: 'users',   label: 'User Management', icon: Users,    accent: 'blue'   },
    { id: 'system',  label: 'System Health',   icon: Activity, accent: 'cyan'},
    { id: 'sources', label: 'Data Sources',    icon: Database, accent: 'amber'  },
    { id: 'assets',  label: 'Assets',          icon: Server,   accent: 'purple' },
] as const

type Tab = typeof TABS[number]['id']

const accentMap = {
    blue:    { active: 'border-primary/50 bg-primary/10 text-primary',   icon: 'text-primary',    dot: 'bg-primary'    },
    cyan: { active: 'border-primary/50 bg-primary/10 text-primary', icon: 'text-primary', dot: 'bg-primary' },
    amber:   { active: 'border-amber-500/50 bg-amber-600/10 text-amber-300',   icon: 'text-amber-400',   dot: 'bg-amber-500'   },
    purple:  { active: 'border-purple-500/50 bg-purple-600/10 text-purple-300', icon: 'text-purple-400',  dot: 'bg-purple-500'  },
}

export default function AdminPage() {
    const { profile, loading, can } = useAuth()
    const router = useRouter()
    
    const availableTabs = TABS.filter(t => {
        if (t.id === 'users') return can('canManageUsers')
        if (t.id === 'sources') return can('canConfigureSources')
        if (t.id === 'assets') return can('canManageAssets')
        if (t.id === 'system') return can('canViewAuditLogs')
        return false
    })

    const [tab, setTab] = useState<Tab | null>(null)

    useEffect(() => {
        if (!loading && availableTabs.length === 0) {
            router.push('/dashboard')
        } else if (!tab && availableTabs.length > 0) {
            setTab(availableTabs[0].id)
        }
    }, [loading, availableTabs.length, router, tab])

    if (loading || availableTabs.length === 0 || !tab) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="min-h-full bg-[#080c14]">
            {/* Hero */}
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d1628] to-[#080c14]">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.3) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute -top-16 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -top-16 right-16 w-56 h-56 rounded-full bg-red-600/10 blur-3xl" />
                <div className="relative z-10 px-8 pt-8">
                    <p className="text-xs text-slate-400/60 uppercase tracking-widest font-medium">Account / Admin Panel</p>
                    <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Admin Panel</h1>
                    <p className="text-sm text-slate-400 mt-0.5">System configuration, user management, and audit controls</p>
                </div>
            </div>

            {/* Tabs + Content */}
            <div className="px-6 md:px-10 mt-5 max-w-6xl mx-auto pb-16 space-y-5">
                {/* Tab bar */}
                <div className="flex flex-wrap gap-2">
                    {availableTabs.map(t => {
                        const a = accentMap[t.accent]
                        const isActive = tab === t.id
                        return (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                    isActive ? a.active + ' border' : 'border-slate-700/50 text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
                                }`}>
                                <t.icon className={`w-4 h-4 ${isActive ? '' : 'text-slate-500'}`} />
                                {t.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                {tab === 'users'   && <UsersTab />}
                {tab === 'system'  && <SystemTab />}
                {tab === 'sources' && <DataSourcesTab />}
                {tab === 'assets'  && <AssetsTab />}
            </div>
        </div>
    )
}

