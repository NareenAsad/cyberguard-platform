interface QuickStatsProps {
    metrics: {
        threatsDetected: number
        threatsDetectedChange: number
        riskScore: number
        incidentsActive: number
        systemsMonitored: number
    }
}

export function QuickStats({ metrics }: QuickStatsProps) {
    const hasActivity =
        metrics.threatsDetected > 0 ||
        metrics.threatsDetectedChange > 0 ||
        metrics.incidentsActive > 0 ||
        metrics.riskScore > 0 ||
        metrics.systemsMonitored > 0

    const stats = [
        {
            label: 'Threats (24h)',
            value: hasActivity ? String(metrics.threatsDetectedChange) : '—',
        },
        {
            label: 'Open Incidents',
            value: hasActivity ? String(metrics.incidentsActive) : '—',
        },
        {
            label: 'Average Risk',
            value: hasActivity ? `${metrics.riskScore}%` : '—',
        },
        {
            label: 'Systems Monitored',
            value: hasActivity ? String(metrics.systemsMonitored) : '—',
        },
    ]

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
            <div className="divide-y divide-border">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="font-semibold text-foreground">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
