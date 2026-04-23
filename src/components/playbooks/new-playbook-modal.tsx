'use client'

import { useState } from 'react'
import { X, BookOpen, Loader2 } from 'lucide-react'
import { playbooksAPI } from '@/lib/api-service'

const CATEGORIES = ['RCE', 'Ransomware', 'Web Attack', 'Phishing', 'Data Breach', 'DDoS', 'Insider Threat', 'Other']

interface NewPlaybookModalProps {
    open: boolean
    onClose: () => void
    onCreated: (playbook: any) => void
}

export function NewPlaybookModal({ open, onClose, onCreated }: NewPlaybookModalProps) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: CATEGORIES[0],
        steps: 5,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!open) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!form.title.trim() || !form.description.trim()) {
            setError('Title and description are required.')
            return
        }

        setLoading(true)
        try {
            const result = await playbooksAPI.createPlaybook({
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category,
                steps: form.steps,
            })

            if (result.success) {
                onCreated(result.data)
                setForm({ title: '', description: '', category: CATEGORIES[0], steps: 5 })
                onClose()
            } else {
                setError(result.error || 'Failed to create playbook. Please try again.')
            }
        } catch {
            setError('An unexpected error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">New Playbook</h2>
                            <p className="text-xs text-muted-foreground">Create a new incident response procedure</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Playbook Title <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="e.g. Log4Shell Response Playbook"
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Category <span className="text-destructive">*</span>
                        </label>
                        <select
                            value={form.category}
                            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Description <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Describe the purpose and scope of this response playbook..."
                            rows={3}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                        />
                    </div>

                    {/* Steps */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                            Number of Steps
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={form.steps}
                            onChange={e => setForm(f => ({ ...f, steps: parseInt(e.target.value) || 1 }))}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Playbook'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
