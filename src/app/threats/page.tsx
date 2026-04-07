'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { threatData } from '@/lib/mock-data'

export default function ThreatsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    const filteredThreats = threatData.filter(threat => {
        const matchesSearch = threat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            threat.source.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity = !selectedSeverity || threat.severity === selectedSeverity
        const matchesStatus = !selectedStatus || threat.status === selectedStatus

        return matchesSearch && matchesSeverity && matchesStatus
    })

    const severityBadgeColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-destructive/20 text-destructive'
            case 'high':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'medium':
                return 'bg-blue-500/20 text-blue-400'
            default:
                return 'bg-green-500/20 text-green-400'
        }
    }

    const statusBadgeColor = (status: string) => {
        switch (status) {
            case 'blocked':
                return 'bg-green-500/20 text-green-400'
            case 'mitigating':
                return 'bg-yellow-500/20 text-yellow-400'
            case 'quarantined':
                return 'bg-orange-500/20 text-orange-400'
            default:
                return 'bg-destructive/20 text-destructive'
        }
    }

    return (
        <div className="p-8 space-y-8">
            {/* Page Title */}
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Threats</h2>
                <p className="text-muted-foreground">Monitor and manage detected security threats</p>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-foreground">Filters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by ID, type, or source..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    {/* Severity Filter */}
                    <select
                        value={selectedSeverity || ''}
                        onChange={(e) => setSelectedSeverity(e.target.value || null)}
                        className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">All Severities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus || ''}
                        onChange={(e) => setSelectedStatus(e.target.value || null)}
                        className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="">All Statuses</option>
                        <option value="blocked">Blocked</option>
                        <option value="mitigating">Mitigating</option>
                        <option value="quarantined">Quarantined</option>
                        <option value="isolated">Isolated</option>
                    </select>
                </div>
            </div>

            {/* Threats Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Severity</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Source</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Target</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Detected</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredThreats.map((threat, index) => (
                                <tr
                                    key={threat.id}
                                    className={`border-b border-border hover:bg-secondary/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-secondary/10'
                                        }`}
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-foreground">{threat.id}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{threat.type}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${severityBadgeColor(threat.severity)}`}>
                                            {threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{threat.source}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{threat.target}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{threat.detected}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadgeColor(threat.status)}`}>
                                            {threat.status.charAt(0).toUpperCase() + threat.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredThreats.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-muted-foreground">No threats found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Total Threats</p>
                    <p className="text-2xl font-bold text-foreground">{threatData.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Critical</p>
                    <p className="text-2xl font-bold text-destructive">{threatData.filter(t => t.severity === 'critical').length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Blocked</p>
                    <p className="text-2xl font-bold text-green-400">{threatData.filter(t => t.status === 'blocked').length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Active Response</p>
                    <p className="text-2xl font-bold text-yellow-400">{threatData.filter(t => t.status === 'mitigating').length}</p>
                </div>
            </div>
        </div>
    )
}
