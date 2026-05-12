'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase/client'
import {
    Shield, Bell, Palette, Key, Eye, EyeOff,
    CheckCircle2, AlertCircle, Monitor, Moon, Sun,
    Lock, Smartphone, Activity, ChevronRight, Layers
} from 'lucide-react'

type Section = 'security' | 'notifications' | 'appearance'

const NAV_ITEMS = [
    { id: 'security'      as Section, icon: Shield,  label: 'Security',       desc: 'Password & sessions', accent: 'blue'   as const },
    { id: 'notifications' as Section, icon: Bell,    label: 'Notifications',  desc: 'Alerts & reports',    accent: 'amber'  as const },
    { id: 'appearance'    as Section, icon: Palette, label: 'Appearance',     desc: 'Theme & density',     accent: 'purple' as const },
]

const accentMap = {
    blue:   { icon: 'text-emerald-400',   bg: 'bg-emerald-500/10',   border: 'border-emerald-500/30',   active: 'bg-emerald-600/15 border-emerald-500/40' },
    amber:  { icon: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  active: 'bg-amber-600/15 border-amber-500/40' },
    purple: { icon: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', active: 'bg-purple-600/15 border-purple-500/40' },
}

const NOTIF_KEY = 'cg_notif_prefs'
const DENSITY_KEY = 'cg_density'

export default function SettingsPage() {
    const { user } = useAuth()
    const [section, setSection] = useState<Section>('security')

    return (
        <div className="bg-[#080c14]">
            {/* ── Hero Banner ── */}
            <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d1628] to-[#080c14]">
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
                                          linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                <div className="absolute -top-24 left-1/3 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl" />
                <div className="absolute -top-16 right-10 w-60 h-60 rounded-full bg-purple-600/10 blur-3xl" />
                <div className="relative z-10 px-8 pt-8">
                    <p className="text-xs text-slate-400/60 uppercase tracking-widest font-medium">
                        Account&nbsp;/&nbsp;Settings
                    </p>
                    <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Settings</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Configure security, notifications, and preferences</p>
                </div>
            </div>

            {/* ── Main layout ── */}
            <div className="px-6 md:px-10 mt-5 max-w-5xl mx-auto pb-16">
                <div className="flex flex-col md:flex-row gap-5">

                    {/* Sidebar */}
                    <aside className="md:w-56 flex-shrink-0">
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-xl p-2 space-y-1">
                            {NAV_ITEMS.map(item => {
                                const a = accentMap[item.accent]
                                const isActive = section === item.id
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 text-left group ${
                                            isActive ? `${a.active} border shadow-sm` : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700/40'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                                            isActive ? `${a.bg} ${a.border} border` : 'bg-slate-800/60'
                                        }`}>
                                            <item.icon className={`w-4 h-4 ${isActive ? a.icon : 'text-slate-500 group-hover:text-slate-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-tight ${isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                                {item.label}
                                            </p>
                                            <p className="text-[11px] text-slate-600 group-hover:text-slate-500 transition-colors leading-tight mt-0.5">
                                                {item.desc}
                                            </p>
                                        </div>
                                        {isActive && <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${a.icon}`} />}
                                    </button>
                                )
                            })}
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {section === 'security'      && <SecuritySection email={user?.email || ''} />}
                        {section === 'notifications' && <NotificationsSection />}
                        {section === 'appearance'    && <AppearanceSection />}
                    </div>
                </div>
            </div>
        </div>
    )
}


// ── Security ─────────────────────────────────────────────────────────────────

function SecuritySection({ email }: { email: string }) {
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew,     setShowNew]     = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [saving,      setSaving]      = useState(false)
    const [saved,       setSaved]       = useState(false)
    const [error,       setError]       = useState('')
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })

    async function handleChangePassword() {
        setError('')
        if (passwords.newPass !== passwords.confirm) { setError('New passwords do not match'); return }
        if (passwords.newPass.length < 8)            { setError('Password must be at least 8 characters'); return }
        setSaving(true)
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.updateUser({ password: passwords.newPass })
            if (error) throw error
            setSaved(true)
            setPasswords({ current: '', newPass: '', confirm: '' })
            setTimeout(() => setSaved(false), 3000)
        } catch (e: any) {
            setError(e.message || 'Failed to update password')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <SectionCard icon={Key} title="Change Password" description="Use a strong, unique password" accent="blue">
                <div className="space-y-4">
                    <PwField label="Current Password"     value={passwords.current} show={showCurrent} onToggle={() => setShowCurrent(s => !s)} onChange={v => setPasswords(p => ({ ...p, current: v }))} />
                    <PwField label="New Password"         value={passwords.newPass} show={showNew}     onToggle={() => setShowNew(s => !s)}     onChange={v => setPasswords(p => ({ ...p, newPass: v }))} />
                    <PwField label="Confirm New Password" value={passwords.confirm} show={showConfirm} onToggle={() => setShowConfirm(s => !s)} onChange={v => setPasswords(p => ({ ...p, confirm: v }))} />
                </div>

                {passwords.newPass && <PasswordStrength password={passwords.newPass} />}

                {error && <Alert type="error">{error}</Alert>}
                {saved && <Alert type="success">Password updated successfully</Alert>}

                <ActionButton
                    onClick={handleChangePassword}
                    disabled={saving || !passwords.current || !passwords.newPass || !passwords.confirm}
                    loading={saving}
                    accent="blue"
                    icon={Lock}
                    label="Update Password"
                    loadingLabel="Updating…"
                />
            </SectionCard>

            <SectionCard icon={Activity} title="Active Sessions" description="Devices currently signed in" accent="blue">
                <div className="space-y-2">
                    {[
                        { device: 'Windows PC', browser: 'Chrome', location: 'Current session', time: 'Active now', current: true },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/40">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center">
                                    <Monitor className="w-4 h-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">
                                        {s.device}&nbsp;<span className="text-slate-500">·</span>&nbsp;{s.browser}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">{s.location} · {s.time}</p>
                                </div>
                            </div>
                            {s.current
                                ? <span className="text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">● Current</span>
                                : <button className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors">Revoke</button>
                            }
                        </div>
                    ))}
                </div>
            </SectionCard>

            <SectionCard icon={Smartphone} title="Two-Factor Authentication" description="Add an extra layer of security" accent="blue">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700/50 border border-slate-600/40 flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-200">Authenticator App</p>
                            <p className="text-xs text-slate-500 mt-0.5">TOTP-based two-factor authentication</p>
                        </div>
                    </div>
                    <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl transition-all">
                        Enable
                    </button>
                </div>
            </SectionCard>
        </div>
    )
}


// ── Notifications ─────────────────────────────────────────────────────────────

const DEFAULT_PREFS = {
    critical_alerts:   true,
    high_alerts:       true,
    medium_alerts:     false,
    weekly_report:     true,
    agent_complete:    true,
    incident_assigned: true,
}

function NotificationsSection() {
    const [prefs, setPrefs] = useState(DEFAULT_PREFS)
    const [saved, setSaved] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(NOTIF_KEY)
            if (stored) setPrefs(JSON.parse(stored))
        } catch {}
    }, [])

    const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }))

    function handleSave() {
        localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const groups = [
        {
            title: 'Threat Alerts',
            items: [
                { key: 'critical_alerts'   as const, label: 'Critical Threats',       desc: 'Risk score ≥ 70 — immediate action required', badge: 'CRITICAL', badgeColor: 'text-red-400 bg-red-500/10 border-red-500/30' },
                { key: 'high_alerts'       as const, label: 'High Severity',           desc: 'Risk score 50–69',                             badge: 'HIGH',     badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
                { key: 'medium_alerts'     as const, label: 'Medium Severity',         desc: 'Risk score 30–49',                             badge: 'MEDIUM',   badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
            ]
        },
        {
            title: 'Reports & Activities',
            items: [
                { key: 'weekly_report'     as const, label: 'Weekly Security Report',  desc: 'Executive summary delivered every Monday',   badge: null, badgeColor: '' },
                { key: 'agent_complete'    as const, label: 'AI Analysis Complete',    desc: 'Notify when the analysis pipeline finishes', badge: null, badgeColor: '' },
                { key: 'incident_assigned' as const, label: 'Incident Assigned to Me', desc: 'Alert when an incident is assigned to you',  badge: null, badgeColor: '' },
            ]
        },
    ]

    return (
        <SectionCard icon={Bell} title="Notification Preferences" description="Choose what you want to hear about" accent="amber">
            <div className="space-y-6">
                {groups.map(group => (
                    <div key={group.title}>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 pl-1">
                            {group.title}
                        </p>
                        <div className="space-y-2">
                            {group.items.map(item => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer"
                                    onClick={() => toggle(item.key)}
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-medium text-slate-200">{item.label}</p>
                                            {item.badge && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                    </div>
                                    {/* Toggle switch */}
                                    <div
                                        className={`relative w-11 h-6 rounded-full flex-shrink-0 ml-4 transition-all duration-300 ${
                                            prefs[item.key] ? 'bg-amber-500' : 'bg-slate-700'
                                        }`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                            prefs[item.key] ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {saved && <Alert type="success">Notification preferences saved</Alert>}

            <ActionButton
                onClick={handleSave}
                accent="amber"
                icon={CheckCircle2}
                label="Save Preferences"
            />
        </SectionCard>
    )
}


// ── Appearance ────────────────────────────────────────────────────────────────

function AppearanceSection() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [density,     setDensity]     = useState<'compact' | 'comfortable'>('comfortable')
    const [densitySaved, setDensitySaved] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => { setMounted(true) }, [])

    // Load saved density on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(DENSITY_KEY) as 'compact' | 'comfortable' | null
            if (stored) {
                setDensity(stored)
                document.documentElement.setAttribute('data-density', stored)
            }
        } catch {}
    }, [])

    function handleSaveDensity() {
        localStorage.setItem(DENSITY_KEY, density)
        document.documentElement.setAttribute('data-density', density)
        setDensitySaved(true)
        setTimeout(() => setDensitySaved(false), 3000)
    }

    const themes = [
        { id: 'dark'   as const, icon: Moon,    label: 'Dark',   desc: 'Easy on the eyes' },
        { id: 'light'  as const, icon: Sun,     label: 'Light',  desc: 'Bright & clean'   },
        { id: 'system' as const, icon: Monitor, label: 'System', desc: 'Follow OS setting' },
    ]

    const currentTheme = mounted ? theme : 'dark'

    return (
        <div className="space-y-4">
            <SectionCard icon={Palette} title="Theme" description="Choose your preferred color scheme" accent="purple">
                <div className="grid grid-cols-3 gap-3">
                    {themes.map(t => {
                        const isActive = currentTheme === t.id
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 ${
                                    isActive
                                        ? 'border-purple-500/60 bg-purple-600/10 shadow-sm shadow-purple-500/10'
                                        : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/60 hover:bg-slate-800/50'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                    isActive ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-slate-700/60'
                                }`}>
                                    <t.icon className={`w-5 h-5 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
                                </div>
                                <div className="text-center">
                                    <p className={`text-sm font-semibold ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>{t.label}</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{t.desc}</p>
                                </div>
                                {isActive && (
                                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                        ACTIVE
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
                <p className="text-xs text-slate-500">Theme is applied instantly — no need to save.</p>
            </SectionCard>

            <SectionCard icon={Layers} title="Display Density" description="Control spacing and information density" accent="purple">
                <div className="grid grid-cols-2 gap-3">
                    {(['compact', 'comfortable'] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setDensity(d)}
                            className={`flex flex-col gap-1.5 p-4 rounded-xl border transition-all duration-200 text-left ${
                                density === d
                                    ? 'border-purple-500/60 bg-purple-600/10'
                                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/60'
                            }`}
                        >
                            <p className={`text-sm font-semibold capitalize ${density === d ? 'text-purple-200' : 'text-slate-400'}`}>{d}</p>
                            <p className="text-xs text-slate-500">
                                {d === 'compact' ? 'More content, tighter spacing' : 'Easier to read, more breathing room'}
                            </p>
                        </button>
                    ))}
                </div>

                {densitySaved && <Alert type="success">Display density saved</Alert>}

                <ActionButton
                    onClick={handleSaveDensity}
                    accent="purple"
                    icon={CheckCircle2}
                    label="Save Density"
                />
            </SectionCard>
        </div>
    )
}


// ── Shared helpers ────────────────────────────────────────────────────────────

function SectionCard({
    icon: Icon, title, description, accent, children
}: {
    icon: any; title: string; description: string; accent: 'blue' | 'amber' | 'purple'; children: React.ReactNode
}) {
    const a = accentMap[accent]
    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl p-6 space-y-5">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${a.icon}`} />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
    )
}

function Alert({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
    return (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-2.5 border ${
            type === 'success'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
        }`}>
            {type === 'success'
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle  className="w-4 h-4 flex-shrink-0" />
            }
            {children}
        </div>
    )
}

function ActionButton({ onClick, disabled, loading, accent, icon: Icon, label, loadingLabel }: {
    onClick: () => void; disabled?: boolean; loading?: boolean
    accent: 'blue' | 'amber' | 'purple'; icon: any; label: string; loadingLabel?: string
}) {
    const colors = {
        blue:   'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/25',
        amber:  'bg-amber-600 hover:bg-amber-500 hover:shadow-amber-500/25',
        purple: 'bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/25',
    }
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${colors[accent]}`}
        >
            <Icon className="w-4 h-4" />
            {loading ? (loadingLabel || label) : label}
        </button>
    )
}

function PwField({ label, value, show, onToggle, onChange }: {
    label: string; value: string; show: boolean
    onToggle: () => void; onChange: (v: string) => void
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}

function PasswordStrength({ password }: { password: string }) {
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)]
    const score  = checks.filter(Boolean).length
    const labels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-emerald-400']
    return (
        <div className="space-y-1.5">
            <div className="flex gap-1.5">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : 'bg-slate-700'}`} />
                ))}
            </div>
            <p className="text-xs text-slate-500">{labels[score]}</p>
        </div>
    )
}

