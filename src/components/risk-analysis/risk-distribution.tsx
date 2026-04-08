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
} from 'recharts'

interface RiskDistributionProps {
    data: Array<{
        name: string
        riskLevel: number
        vulnerabilities: number
    }>
}

export function RiskDistribution({ data }: RiskDistributionProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
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
    )
}
