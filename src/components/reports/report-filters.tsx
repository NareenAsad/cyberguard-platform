'use client'

import { Filter, X } from 'lucide-react'

interface DateRange {
    from: string
    to: string
}

interface ReportFiltersProps {
    reportTypes: string[]
    selectedType: string | null
    onSelectType: (type: string | null) => void
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
}

export function ReportFilters({
    reportTypes,
    selectedType,
    onSelectType,
    dateRange,
    onDateRangeChange,
}: ReportFiltersProps) {
    const hasActiveFilters = selectedType !== null || dateRange.from || dateRange.to

    const clearAll = () => {
        onSelectType(null)
        onDateRangeChange({ from: '', to: '' })
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 h-fit space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* Report Type */}
            <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium block">Report Type</label>
                <div className="space-y-1.5">
                    <button
                        onClick={() => onSelectType(null)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                            selectedType === null
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
                            className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                                selectedType === type
                                    ? 'bg-primary/20 text-primary border border-primary'
                                    : 'text-muted-foreground hover:bg-secondary'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2 pt-4 border-t border-border">
                <label className="text-xs text-muted-foreground font-medium block">Date Range</label>
                <div className="space-y-2">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">From</p>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">To</p>
                        <input
                            type="date"
                            value={dateRange.to}
                            min={dateRange.from || undefined}
                            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                            className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        />
                    </div>
                </div>
                {(dateRange.from || dateRange.to) && (
                    <button
                        onClick={() => onDateRangeChange({ from: '', to: '' })}
                        className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
                    >
                        Clear dates
                    </button>
                )}
            </div>
        </div>
    )
}
