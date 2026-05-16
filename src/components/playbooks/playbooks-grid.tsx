'use client'

import { PlaybookCard } from './playbook-card'

interface Playbook {
  id: string
  title: string
  description?: string
  category?: string
  content?: { steps?: number } | null
  lastUpdated: string
  steps?: number
}

interface PlaybooksGridProps {
  playbooks: Playbook[]
  onSelect: (playbook: Playbook) => void
  onDelete: (id: string) => void
}

export function PlaybooksGrid({ playbooks, onSelect, onDelete }: PlaybooksGridProps) {
  if (playbooks.length === 0) {
    return (
      <div className="lg:col-span-3 flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-card border-border border-dashed">
        <h3 className="text-lg font-medium text-foreground mb-2">No Playbooks Found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There are no playbooks available. Wait for the AI agent to generate response playbooks during an active incident, or check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playbooks.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
