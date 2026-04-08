'use client'

interface Risk {
    riskLevel: number
    vulnerabilities: number
}

interface RiskStatisticsProps {
    risks: Risk[]
}

export function RiskStatistics({ risks }: RiskStatisticsProps) {
    const criticalCount = risks.filter(r => r.riskLevel >= 70).length
    const totalVulnerabilities = risks.reduce((sum, r) => sum + r.vulnerabilities, 0)
    const avgRiskScore = Math.round(risks.reduce((sum, r) => sum + r.riskLevel, 0) / risks.length)

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
                <p className="text-3xl font-bold text-foreground">{risks.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Critical Assets</p>
                <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Total Vulnerabilities</p>
                <p className="text-3xl font-bold text-yellow-400">{totalVulnerabilities}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Avg Risk Score</p>
                <p className="text-3xl font-bold text-accent">{avgRiskScore}%</p>
            </div>
        </div>
    )
}
