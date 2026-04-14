'use client'

import { Filter } from 'lucide-react'

interface ReportFiltersProps {
    reportTypes: string[]
    selectedType: string | null
    onSelectType: (type: string | null) => void
}

export function ReportFilters({
    reportTypes,
    selectedType,
    onSelectType,
}: ReportFiltersProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 h-fit space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Filters</h3>
            </div>

            <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium block">Report Type</label>
                <div className="space-y-2">
                    <button
                        onClick={() => onSelectType(null)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${selectedType === null
                                ? 'bg-primary/20 text-primary border border-primary'
                                : 'text-muted-foreground hover:bg-secondary'
                            }`}
                    >
                        All Reports
                    </button>
                    {reportTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => onSelectType(type)}
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${selectedType === type
                                    ? 'bg-primary/20 text-primary border border-primary'
                                    : 'text-muted-foreground hover:bg-secondary'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-xs text-muted-foreground font-medium block">Date Range</label>
                <input
                    type="date"
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                    type="date"
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>
        </div>
    )
}
