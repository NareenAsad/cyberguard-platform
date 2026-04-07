export function QuickStats() {
    const stats = [
        { label: 'Detection Rate', value: '77%' },
        { label: 'Response Time', value: '2.3 min' },
        { label: 'False Positives', value: '3%' },
        { label: 'System Uptime', value: '99.99%' },
    ]

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
            <div className="space-y-3">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center pb-3 border-b border-border last:border-b-0 last:pb-0">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <span className="font-semibold text-foreground">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
