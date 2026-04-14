'use client'

interface Threat {
    severity: string
    status: string
}

interface ThreatsSummaryProps {
    threats: Threat[]
}

export function ThreatsSummary({ threats }: ThreatsSummaryProps) {
    const critical = threats.filter(t => t.severity === 'critical').length
    const blocked = threats.filter(t => t.status === 'blocked').length
    const mitigating = threats.filter(t => t.status === 'mitigating').length

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Threats</p>
                <p className="text-2xl font-bold text-foreground">{threats.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Critical</p>
                <p className="text-2xl font-bold text-destructive">{critical}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Blocked</p>
                <p className="text-2xl font-bold text-green-400">{blocked}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Active Response</p>
                <p className="text-2xl font-bold text-yellow-400">{mitigating}</p>
            </div>
        </div>
    )
}
