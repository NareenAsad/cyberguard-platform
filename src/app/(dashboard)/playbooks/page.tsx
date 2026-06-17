'use client'

import { useState, useEffect } from 'react'
import { PlaybookCategories } from '@/components/playbooks/playbook-categories'
import { PlaybooksGrid } from '@/components/playbooks/playbooks-grid'
import { PlaybookDetailPanel } from '@/components/playbooks/playbook-detail-panel'
import { playbooksAPI } from '@/lib/api-service'
import { usePageRefresh } from '@/hooks/use-page-refresh'
import { Playbook } from '@/components/playbooks/playbook-card'

export default function PlaybooksPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [playbooks, setPlaybooks] = useState<Playbook[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)

    const fetchPlaybooks = async () => {
        setLoading(true)
        try {
            const data = await playbooksAPI.getPlaybooks()
            if (data) {
                setPlaybooks(data)
            }
        } catch (error) {
            console.error("Failed to fetch playbooks:", error)
        } finally {
            setLoading(false)
        }
    }

    usePageRefresh('playbooks', fetchPlaybooks)

    useEffect(() => {
        fetchPlaybooks()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            const result = await playbooksAPI.deletePlaybook(id)
            if (result.success) {
                setPlaybooks(prev => prev.filter(p => p.id !== id))
                if (selectedPlaybook?.id === id) setSelectedPlaybook(null)
            }
        } catch (error) {
            console.error("Failed to delete playbook:", error)
        }
    }

    const categories = Array.from(new Set(playbooks.map(p => p.category).filter((c): c is string => !!c)))

    const filteredPlaybooks = selectedCategory
        ? playbooks.filter(p => p.category === selectedCategory)
        : playbooks

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Page Title */}
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Response Playbooks</h2>
                <p className="text-sm md:text-base text-muted-foreground">Pre-built and custom incident response procedures</p>
            </div>

            {loading ? (
                <div>Loading playbooks...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <PlaybookCategories
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                    <PlaybooksGrid
                        playbooks={filteredPlaybooks}
                        onSelect={setSelectedPlaybook}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            <PlaybookDetailPanel
                playbook={selectedPlaybook}
                onClose={() => setSelectedPlaybook(null)}
            />
        </div>
    )
}
