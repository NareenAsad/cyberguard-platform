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
}

export function PlaybooksGrid({ playbooks, onSelect }: PlaybooksGridProps) {
  return (
    <div className="lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playbooks.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
