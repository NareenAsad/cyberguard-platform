'use client'

import { AlertTriangle } from 'lucide-react'

interface Risk {
    asset: string
    riskLevel: number
    vulnerabilities: number
    exposureTime: string
    recommendation: string
}

interface RiskPrioritizationProps {
    risks: Risk[]
}

export function RiskPrioritization({ risks }: RiskPrioritizationProps) {
    const getRiskColor = (level: number) => {
        if (level >= 70) return 'text-destructive'
        if (level >= 50) return 'text-yellow-400'
        if (level >= 30) return 'text-blue-400'
        return 'text-green-400'
    }

    const getRiskBgColor = (level: number) => {
        if (level >= 70) return 'bg-destructive/20'
        if (level >= 50) return 'bg-yellow-500/20'
        if (level >= 30) return 'bg-blue-500/20'
        return 'bg-green-500/20'
    }

    const getRiskBarColor = (level: number) => {
        if (level >= 70) return 'bg-destructive'
        if (level >= 50) return 'bg-yellow-500'
        if (level >= 30) return 'bg-blue-500'
        return 'bg-green-500'
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">Risk Prioritization</h3>
            </div>

            <div className="space-y-4">
                {risks.map((risk, index) => (
                    <div
                        key={risk.asset}
                        className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-muted-foreground w-6">{index + 1}.</span>
                                    <h4 className="font-semibold text-foreground">{risk.asset}</h4>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${getRiskColor(risk.riskLevel)}`}>
                                {risk.riskLevel}%
                            </div>
                        </div>

                        <div className={`h-2 rounded-full mb-3 overflow-hidden ${getRiskBgColor(risk.riskLevel)}`}>
                            <div
                                className={`h-full rounded-full transition-all ${getRiskBarColor(risk.riskLevel)}`}
                                style={{ width: `${risk.riskLevel}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                                <p className="text-muted-foreground text-xs">Vulnerabilities</p>
                                <p className="font-semibold text-foreground">{risk.vulnerabilities}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Exposure Time</p>
                                <p className="font-semibold text-foreground">{risk.exposureTime}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground text-xs">Severity</p>
                                <p
                                    className={`font-semibold ${risk.riskLevel >= 70
                                            ? 'text-destructive'
                                            : risk.riskLevel >= 50
                                                ? 'text-yellow-400'
                                                : 'text-blue-400'
                                        }`}
                                >
                                    {risk.riskLevel >= 70 ? 'Critical' : risk.riskLevel >= 50 ? 'High' : 'Medium'}
                                </p>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                            <p className="text-xs text-muted-foreground mb-1">Recommendation</p>
                            <p className="text-sm text-foreground font-medium">{risk.recommendation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
