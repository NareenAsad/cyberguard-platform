'use client'

import { BookOpen, CheckCircle, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export interface Playbook {
    id: string
    playbookId?: string
    title: string
    description?: string
    category?: string
    content?: { steps?: number } | null
    lastUpdated: string
    // legacy fields from seed data
    steps?: number
}

interface PlaybookCardProps {
    playbook: Playbook
    onSelect: (playbook: Playbook) => void
    onDelete: (id: string) => void
}

export function PlaybookCard({ playbook, onSelect, onDelete }: PlaybookCardProps) {
    const { can } = useAuth()
    // steps lives in content.steps (new) or top-level steps (seeded data)
    const steps = playbook.content?.steps ?? playbook.steps ?? null

    // Format lastUpdated date nicely
    const updatedDisplay = playbook.lastUpdated
        ? new Date(playbook.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'

    return (
        <div
            onClick={() => onSelect(playbook)}
            className="text-left p-6 border rounded-lg bg-card border-border cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded">
                        {playbook.category ?? 'General'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{playbook.playbookId ?? playbook.id}</span>
                    {can('canDeleteData') && (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(playbook.id)
                            }}
                            className="p-1 hover:bg-red-500/20 rounded-md text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete Playbook"
                        >
                            <Trash2 className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-foreground mb-2 text-base">{playbook.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {playbook.description ?? '—'}
            </p>

            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    {steps !== null ? `${steps} steps` : 'Custom'}
                </div>
                <span className="text-muted-foreground">Updated {updatedDisplay}</span>
            </div>
        </div>
    )
}
