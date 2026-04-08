'use client'

import { BookOpen, CheckCircle } from 'lucide-react'

interface Playbook {
    id: string
    title: string
    description: string
    category: string
    steps: number
    lastUpdated: string
}

interface PlaybookCardProps {
    playbook: Playbook
    isSelected: boolean
    onSelect: (id: string) => void
}

export function PlaybookCard({ playbook, isSelected, onSelect }: PlaybookCardProps) {
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
                        {playbook.category}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground">{playbook.id}</span>
            </div>

            <h3 className="font-bold text-foreground mb-2 text-base">{playbook.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {playbook.description}
            </p>

            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    {playbook.steps} steps
                </div>
                <span className="text-muted-foreground">Updated {playbook.lastUpdated}</span>
            </div>
        </button>
    )
}
