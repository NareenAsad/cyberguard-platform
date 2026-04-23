'use client'

import { BookOpen, CheckCircle } from 'lucide-react'

interface Playbook {
    id: string
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
    isSelected: boolean
    onSelect: (id: string) => void
}

export function PlaybookCard({ playbook, isSelected, onSelect }: PlaybookCardProps) {
    // steps lives in content.steps (new) or top-level steps (seeded data)
    const steps = playbook.content?.steps ?? playbook.steps ?? null

    // Format lastUpdated date nicely
    const updatedDisplay = playbook.lastUpdated
        ? new Date(playbook.lastUpdated).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'

    return (
        <button
            onClick={() => onSelect(playbook.id)}
            className={`text-left p-6 border rounded-lg transition-all hover:border-accent ${isSelected ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:bg-secondary/50'
                }`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <span className="text-xs bg-secondary/50 text-muted-foreground px-2 py-1 rounded">
                        {playbook.category ?? 'General'}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">{playbook.id}</span>
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
        </button>
    )
}
