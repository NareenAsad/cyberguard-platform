export function QuickStats() {
    const stats = [
        { label: 'Detection Rate', value: '77%' },
        { label: 'Response Time', value: '2.3 min' },
        { label: 'False Positives', value: '3%' },
        { label: 'System Uptime', value: '99.99%' },
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
