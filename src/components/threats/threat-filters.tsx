'use client'

import { Search, Filter } from 'lucide-react'

interface ThreatFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    selectedSeverity: string | null
    onSeverityChange: (value: string | null) => void
    selectedStatus: string | null
    onStatusChange: (value: string | null) => void
}

export function ThreatFilters({
    searchTerm,
    onSearchChange,
    selectedSeverity,
    onSeverityChange,
    selectedStatus,
    onStatusChange,
}: ThreatFiltersProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by ID, type, or source..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <select
                    value={selectedSeverity || ''}
                    onChange={(e) => onSeverityChange(e.target.value || null)}
                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>

                <select
                    value={selectedStatus || ''}
                    onChange={(e) => onStatusChange(e.target.value || null)}
                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="mitigating">Mitigating</option>
                    <option value="quarantined">Quarantined</option>
                    <option value="isolated">Isolated</option>
                </select>
            </div>
        </div>
    )
}
