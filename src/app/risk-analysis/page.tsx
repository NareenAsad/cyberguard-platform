'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
} from 'recharts'
import { riskAnalysis } from '@/lib/mock-data'
import { AlertTriangle } from 'lucide-react'

export default function RiskAnalysisPage() {
    // Prepare data for chart
    const chartData = riskAnalysis.map(item => ({
        name: item.asset.substring(0, 10),
        riskLevel: item.riskLevel,
        vulnerabilities: item.vulnerabilities * 5,
    }))

    // Sort by risk level for prioritization
    const sortedByRisk = [...riskAnalysis].sort((a, b) => b.riskLevel - a.riskLevel)

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

    return (
        <div className="p-8 space-y-8">
            {/* Page Title */}
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Risk Analysis</h2>
                <p className="text-muted-foreground">Asset vulnerabilities and exposure assessment</p>
            </div>

            {/* Risk Overview Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Risk Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
                        <XAxis
                            dataKey="name"
                            stroke="rgba(100, 116, 139, 0.8)"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="rgba(100, 116, 139, 0.8)"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(18, 26, 58, 0.95)',
                                border: '1px solid rgba(30, 41, 59, 0.5)',
                                borderRadius: '6px',
                            }}
                            labelStyle={{ color: 'rgba(232, 234, 246, 1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar
                            dataKey="riskLevel"
                            fill="#f59e0b"
                            name="Risk Level"
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="vulnerabilities"
                            fill="#6366f1"
                            name="Vulnerability Count"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Risk Prioritization */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                    <AlertTriangle className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Risk Prioritization</h3>
                </div>

                <div className="space-y-4">
                    {sortedByRisk.map((risk, index) => (
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

                            {/* Risk Bar */}
                            <div className={`h-2 rounded-full mb-3 overflow-hidden ${getRiskBgColor(risk.riskLevel)}`}>
                                <div
                                    className={`h-full rounded-full transition-all ${risk.riskLevel >= 70
                                            ? 'bg-destructive'
                                            : risk.riskLevel >= 50
                                                ? 'bg-yellow-500'
                                                : risk.riskLevel >= 30
                                                    ? 'bg-blue-500'
                                                    : 'bg-green-500'
                                        }`}
                                    style={{ width: `${risk.riskLevel}%` }}
                                ></div>
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
                                    <p className={`font-semibold ${risk.riskLevel >= 70 ? 'text-destructive' :
                                            risk.riskLevel >= 50 ? 'text-yellow-400' :
                                                'text-blue-400'
                                        }`}>
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

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
                    <p className="text-3xl font-bold text-foreground">{riskAnalysis.length}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Critical Assets</p>
                    <p className="text-3xl font-bold text-destructive">
                        {riskAnalysis.filter(r => r.riskLevel >= 70).length}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Total Vulnerabilities</p>
                    <p className="text-3xl font-bold text-yellow-400">
                        {riskAnalysis.reduce((sum, r) => sum + r.vulnerabilities, 0)}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">Avg Risk Score</p>
                    <p className="text-3xl font-bold text-accent">
                        {Math.round(riskAnalysis.reduce((sum, r) => sum + r.riskLevel, 0) / riskAnalysis.length)}%
                    </p>
                </div>
            </div>
        </div>
    )
}
