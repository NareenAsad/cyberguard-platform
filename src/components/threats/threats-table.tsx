'use client'

interface Threat {
    id: string
    type: string
    severity: string
    source: string
    target: string
    detected: string
    status: string
}

interface ThreatsTableProps {
    threats: Threat[]
}

const severityColors = {
    critical: 'bg-destructive/20 text-destructive',
    high: 'bg-yellow-500/20 text-yellow-400',
    medium: 'bg-emerald-500/20 text-emerald-400',
    low: 'bg-green-500/20 text-green-400',
}

const statusColors = {
    blocked: 'bg-green-500/20 text-green-400',
    mitigating: 'bg-yellow-500/20 text-yellow-400',
    quarantined: 'bg-orange-500/20 text-orange-400',
    isolated: 'bg-destructive/20 text-destructive',
}

export function ThreatsTable({ threats }: ThreatsTableProps) {
    return (
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
                        {threats.map((threat, index) => (
                            <tr key={threat.id} className={`border-b border-border hover:bg-secondary/30 transition-colors ${index % 2 === 0 ? 'bg-card' : 'bg-secondary/10'}`}>
                                <td className="px-6 py-4 text-sm font-medium text-foreground">{threat.id}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{threat.type}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${severityColors[threat.severity as keyof typeof severityColors]}`}>
                                        {threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{threat.source}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{threat.target}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{threat.detected}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[threat.status as keyof typeof statusColors]}`}>
                                        {threat.status.charAt(0).toUpperCase() + threat.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {threats.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-muted-foreground">No threats found matching your filters.</p>
                </div>
            )}
        </div>
    )
}

