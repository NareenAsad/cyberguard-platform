'use client'

import { PlaybookCard } from './playbook-card'

interface Playbook {
  id: string
  title: string
  description: string
  category: string
  steps: number
  lastUpdated: string
}

interface PlaybooksGridProps {
  playbooks: Playbook[]
  selectedPlaybook: string | null
  onSelectPlaybook: (id: string) => void
}

export function PlaybooksGrid({
  playbooks,
  selectedPlaybook,
  onSelectPlaybook,
}: PlaybooksGridProps) {
  return (
    <div className="lg:col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playbooks.map((playbook) => (
          <PlaybookCard
            key={playbook.id}
            playbook={playbook}
            isSelected={selectedPlaybook === playbook.id}
            onSelect={onSelectPlaybook}
          />
        ))}
      </div>
    </div>
  )
}
