'use client'

import { useEffect } from 'react'
import { X, BookOpen, CheckCircle, Shield, RefreshCw, AlertTriangle } from 'lucide-react'

interface Playbook {
    id: string
    title: string
    description?: string
    category?: string
    content?: {
        steps?: number
        containment?: string[]
        eradication?: string[]
        recovery?: string[]
        [key: string]: any
    } | null
    lastUpdated: string
    steps?: number
}

interface PlaybookDetailPanelProps {
    playbook: Playbook | null
    onClose: () => void
}

function StepList({
    icon: Icon,
    label,
    color,
    bg,
    steps,
}: {
    icon: React.ElementType
    label: string
    color: string
    bg: string
    steps: string[]
}) {
    if (!steps || steps.length === 0) return null
    return (
        <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${color}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </div>
            <ol className="space-y-2">
                {steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${bg} ${color}`}>
                            {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                    </li>
                ))}
            </ol>
        </div>
    )
}

export function PlaybookDetailPanel({ playbook, onClose }: PlaybookDetailPanelProps) {
    const isOpen = !!playbook

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const updatedDisplay = playbook?.lastUpdated
        ? new Date(playbook.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'

    const containment = playbook?.content?.containment ?? []
    const eradication = playbook?.content?.eradication ?? []
    const recovery = playbook?.content?.recovery ?? []
    const totalSteps = containment.length + eradication.length + recovery.length

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Centered modal */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="w-full max-w-lg max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col">

                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-border">
                        <div className="flex items-start gap-3 pr-4">
                            <div className="p-2.5 rounded-xl bg-accent/10 shrink-0">
                                <BookOpen className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs bg-secondary/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                        {playbook?.category ?? 'General'}
                                    </span>
                                    <span className="text-xs text-muted-foreground/50">AI Generated</span>
                                </div>
                                <h2 className="text-base font-bold text-foreground leading-snug">{playbook?.title}</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 px-6 py-2.5 bg-secondary/10 border-b border-border text-xs text-muted-foreground">
                        <span className="font-mono text-foreground/50">{playbook?.id}</span>
                        <span>·</span>
                        <span>Updated {updatedDisplay}</span>
                        {totalSteps > 0 && (
                            <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {totalSteps} steps
                                </span>
                            </>
                        )}
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {playbook?.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{playbook.description}</p>
                        )}

                        {totalSteps > 0 ? (
                            <div className="space-y-5">
                                <StepList icon={Shield} label="Containment" color="text-blue-400" bg="bg-blue-500/15" steps={containment} />
                                <StepList icon={AlertTriangle} label="Eradication" color="text-orange-400" bg="bg-orange-500/15" steps={eradication} />
                                <StepList icon={RefreshCw} label="Recovery" color="text-green-400" bg="bg-green-500/15" steps={recovery} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
                                <BookOpen className="w-8 h-8 opacity-20" />
                                <p className="text-sm">No step details available for this playbook.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
