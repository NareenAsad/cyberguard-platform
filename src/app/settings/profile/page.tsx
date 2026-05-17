'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/auth/types'
import {
    Camera, Save, User, Mail, Shield, Clock,
    CheckCircle2, AlertCircle, Fingerprint, LogIn
} from 'lucide-react'

export default function ProfilePage() {
    const { user, profile, loading, refreshProfile } = useAuth()
    const [saving, setSaving] = useState(false)
    const [saved,  setSaved]  = useState(false)
    const [error,  setError]  = useState('')
    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
    })

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
    const initials    = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || 'U'

    async function handleSave() {
        if (!user) return
        setSaving(true); setError(''); setSaved(false)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: form.full_name })
                .eq('id', user.id)
            if (error) throw error
            await refreshProfile()
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e: any) {
            setError(e.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="space-y-3 w-full max-w-2xl px-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl bg-slate-800/40 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>


            {/* ── Avatar card ── */}
            <div className="relative z-10 px-6 md:px-10 mt-6 max-w-4xl mx-auto space-y-5 pb-12">

                {/* Identity card */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Avatar with upload hover */}
                        <div className="relative group flex-shrink-0">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary to-cyan-400 opacity-60 blur group-hover:opacity-90 transition-opacity" />
                            <Avatar className="relative h-24 w-24 ring-2 ring-slate-800">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-bold tracking-wide">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                                title="Change avatar"
                            >
                                <Camera className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Name + meta */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-white tracking-tight truncate">
                                {displayName}
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5 truncate">{user?.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {profile?.role && (
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getRoleBadgeColor(profile.role)}`}>
                                        {getRoleLabel(profile.role)}
                                    </span>
                                )}
                                <span className="text-xs px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium">
                                    ● Active
                                </span>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="hidden lg:flex gap-6 text-center flex-shrink-0 border-l border-slate-700/60 pl-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Member Since</p>
                                <p className="text-sm font-semibold text-slate-200">
                                    {user?.created_at
                                        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                        : '—'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Login</p>
                                <p className="text-sm font-semibold text-slate-200">
                                    {user?.last_sign_in_at
                                        ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Two column layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Personal Information (2/3 width) */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-100">Personal Information</h2>
                                <p className="text-xs text-slate-500">Update your display name</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Full name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        value={form.full_name}
                                        onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                        placeholder="Your full name"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-primary/70 focus:ring-1 focus:ring-primary/30 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email (read-only) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30 text-slate-500 text-sm cursor-not-allowed select-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-medium uppercase tracking-wider">
                                        Locked
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 pl-1">Email cannot be changed from this page</p>
                            </div>
                        </div>

                        {/* Feedback */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}
                        {saved && (
                            <div className="flex items-center gap-2 text-primary text-sm bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Profile saved successfully
                            </div>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>

                    {/* Account Details sidebar (1/3 width) */}
                    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <Fingerprint className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-100">Account Details</h2>
                                <p className="text-xs text-slate-500">Read-only info</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-1">
                            <DetailItem
                                icon={Shield}
                                label="Role"
                                value={profile?.role ? getRoleLabel(profile.role) : 'Analyst'}
                                accent="blue"
                            />
                            <DetailItem
                                icon={Mail}
                                label="Auth Provider"
                                value="Email / Password"
                                accent="slate"
                            />
                            <DetailItem
                                icon={Clock}
                                label="Member Since"
                                value={user?.created_at
                                    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : '—'}
                                accent="slate"
                            />
                            <DetailItem
                                icon={LogIn}
                                label="Last Sign In"
                                value={user?.last_sign_in_at
                                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                    : '—'}
                                accent="emerald"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DetailItem({ icon: Icon, label, value, accent }: {
    icon: any; label: string; value: string; accent: 'blue' | 'cyan' | 'emerald' | 'slate'
}) {
    const colors = {
        blue:    'text-primary bg-primary/10',
        cyan:    'text-cyan-400 bg-cyan-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
        slate:   'text-slate-400 bg-slate-700/40',
    }
    return (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
            <div className={`mt-0.5 p-1.5 rounded-lg ${colors[accent]}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
                <p className="text-sm text-slate-200 font-medium mt-0.5 truncate">{value}</p>
            </div>
        </div>
    )
}

