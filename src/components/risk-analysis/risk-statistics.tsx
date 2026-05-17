'use client'

import { Shield, AlertTriangle, Bug, TrendingUp } from 'lucide-react'

interface Risk {
    riskLevel: number
    vulnerabilities?: number
}

interface RiskStatisticsProps {
    risks: Risk[]
}

export function RiskStatistics({ risks }: RiskStatisticsProps) {
    const criticalCount = risks.filter(r => r.riskLevel >= 70).length
    const highCount = risks.filter(r => r.riskLevel >= 50 && r.riskLevel < 70).length
    const totalVulnerabilities = risks.reduce((sum, r) => sum + (r.vulnerabilities ?? 0), 0)
    const avgRiskScore = risks.length > 0
        ? Math.round(risks.reduce((sum, r) => sum + r.riskLevel, 0) / risks.length)
        : 0

    const cards = [
        {
            label: 'Total Assets',
            value: risks.length,
            suffix: '',
            icon: Shield,
            iconColor: 'text-primary',
            iconBg: 'bg-primary/15 border-primary/25',
            valueColor: 'text-foreground',
            bar: 'bg-primary',
            barWidth: '100%',
        },
        {
            label: 'Critical Assets',
            value: criticalCount,
            suffix: '',
            icon: AlertTriangle,
            iconColor: 'text-red-400',
            iconBg: 'bg-red-500/15 border-red-500/25',
            valueColor: 'text-red-400',
            bar: 'bg-red-500',
            barWidth: risks.length ? `${(criticalCount / risks.length) * 100}%` : '0%',
        },
        {
            label: 'High Risk Assets',
            value: highCount,
            suffix: '',
            icon: Bug,
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/15 border-amber-500/25',
            valueColor: 'text-amber-400',
            bar: 'bg-amber-500',
            barWidth: risks.length ? `${(highCount / risks.length) * 100}%` : '0%',
        },
        {
            label: 'Avg Risk Score',
            value: avgRiskScore,
            suffix: '%',
            icon: TrendingUp,
            iconColor: 'text-primary',
            iconBg: 'bg-primary/15 border-primary/25',
            valueColor: avgRiskScore >= 70 ? 'text-red-400' : avgRiskScore >= 50 ? 'text-amber-400' : 'text-primary',
            bar: avgRiskScore >= 70 ? 'bg-red-500' : avgRiskScore >= 50 ? 'bg-amber-500' : 'bg-primary',
            barWidth: `${avgRiskScore}%`,
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.label} className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/30 transition-colors">
                    {/* Icon + label */}
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.iconBg}`}>
                            <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                    </div>

                    {/* Value */}
                    <p className={`text-3xl font-black tracking-tight ${card.valueColor}`}>
                        {card.value}{card.suffix}
                    </p>

                    {/* Mini progress bar */}
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${card.bar}`}
                            style={{ width: card.barWidth }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
