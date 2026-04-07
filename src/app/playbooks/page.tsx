'use client'

import { useState } from 'react'
import { playbooks } from '@/lib/mock-data'
import { Plus, BookOpen, CheckCircle, Play } from 'lucide-react'

export default function PlaybooksPage() {
    const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const categories = Array.from(new Set(playbooks.map(p => p.category)))

    const filteredPlaybooks = selectedCategory
        ? playbooks.filter(p => p.category === selectedCategory)
        : playbooks

    const currentPlaybook = playbooks.find(p => p.id === selectedPlaybook)

    return (
        <div className="p-8 space-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Response Playbooks</h2>
                    <p className="text-muted-foreground">Pre-built and custom incident response procedures</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                    <Plus className="w-5 h-5" />
                    New Playbook
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories */}
                <div className="bg-card border border-border rounded-lg p-6 h-fit">
                    <h3 className="font-semibold text-foreground mb-4">Categories</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === null
                                    ? 'bg-primary/20 text-primary border border-primary'
                                    : 'text-muted-foreground hover:bg-secondary'
                                }`}
                        >
                            All Playbooks
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === category
                                        ? 'bg-primary/20 text-primary border border-primary'
                                        : 'text-muted-foreground hover:bg-secondary'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Playbooks List */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredPlaybooks.map((playbook) => (
                            <button
                                key={playbook.id}
                                onClick={() => setSelectedPlaybook(playbook.id)}
                                className={`text-left p-6 border rounded-lg transition-all hover:border-accent ${selectedPlaybook === playbook.id
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-card border-border hover:bg-secondary/50'
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
                                    <span className="text-muted-foreground">
                                        Updated {playbook.lastUpdated}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Playbook Details */}
            {selectedPlaybook && currentPlaybook && (
                <div className="bg-card border border-border rounded-lg p-8">
                    <div className="flex items-start justify-between mb-6 border-b border-border pb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">{currentPlaybook.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>ID: {currentPlaybook.id}</span>
                                <span>Category: {currentPlaybook.category}</span>
                                <span>Updated by: {currentPlaybook.updatedBy}</span>
                                <span>Last Updated: {currentPlaybook.lastUpdated}</span>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shrink-0">
                            <Play className="w-5 h-5" />
                            Execute Playbook
                        </button>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground">Execution Steps</h4>

                        {Array.from({ length: currentPlaybook.steps }).map((_, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary/70 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-foreground mb-1">
                                        Step {index + 1}: {
                                            index === 0 ? 'Isolate affected systems' :
                                                index === 1 ? 'Enable enhanced monitoring' :
                                                    index === 2 ? 'Collect forensic evidence' :
                                                        index === 3 ? 'Notify security team' :
                                                            index === 4 ? 'Begin analysis' :
                                                                index === 5 ? 'Execute remediation' :
                                                                    index === 6 ? 'Verify containment' :
                                                                        'Document and review'
                                        }
                                    </h5>
                                    <p className="text-sm text-muted-foreground">
                                        Automated action will be executed during playbook run
                                    </p>
                                </div>
                                <button className="px-3 py-1 bg-secondary border border-border rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Configure
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Execution History */}
                    <div className="mt-8 pt-8 border-t border-border space-y-4">
                        <h4 className="font-semibold text-foreground">Execution History</h4>
                        <div className="space-y-2">
                            {[
                                { date: 'Mar 24, 14:32', status: 'Completed', duration: '8m 32s' },
                                { date: 'Mar 22, 09:15', status: 'Completed', duration: '12m 45s' },
                                { date: 'Mar 20, 16:48', status: 'Completed', duration: '6m 18s' },
                            ].map((execution, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{execution.date}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-green-400 font-medium">{execution.status}</span>
                                        <span className="text-xs text-muted-foreground">{execution.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
