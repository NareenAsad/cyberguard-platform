'use client'

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { BarChart2 } from 'lucide-react'

interface RiskDistributionProps {
    data: Array<{
        name: string
        riskLevel: number
        vulnerabilities: number
    }>
}

const getRiskColor = (riskLevel: number) => {
    if (riskLevel >= 70) return '#ef4444'   // red — critical
    if (riskLevel >= 50) return '#f59e0b'   // amber — high
    if (riskLevel >= 30) return '#00e676'   // neon green — medium
    return '#00e5ff'                        // cyan — low
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-lg px-4 py-3 shadow-xl text-xs space-y-1.5">
            <p className="font-bold text-white text-sm mb-2">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: entry.color }} />
                    <span className="text-slate-400">{entry.name}:</span>
                    <span className="text-white font-semibold">{entry.value}{entry.name === 'Risk Level' ? '%' : ''}</span>
                </div>
            ))}
        </div>
    )
}

export function RiskDistribution({ data }: RiskDistributionProps) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Risk Distribution</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
                    <BarChart2 className="w-10 h-10 text-muted-foreground opacity-30 mb-3" />
                    <p className="text-muted-foreground text-sm">No risk data available yet</p>
                    <p className="text-muted-foreground text-xs mt-1">Run the AI agent to generate risk analysis</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                        <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">Risk Distribution</h3>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-secondary inline-block" />
                        Risk Level
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />
                        Vulnerabilities
                    </span>
                </div>
            </div>

            {/* Risk tier color guide */}
            <div className="flex gap-3 mb-5 flex-wrap">
                {[
                    { label: 'Critical ≥70', color: '#ef4444' },
                    { label: 'High ≥50', color: '#f59e0b' },
                    { label: 'Medium ≥30', color: '#00e676' },
                    { label: 'Low <30', color: '#00e5ff' },
                ].map(tier => (
                    <span key={tier.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: tier.color }} />
                        {tier.label}
                    </span>
                ))}
            </div>

            <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <defs>
                        <linearGradient id="vulnGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(100, 116, 139, 0.15)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="transparent"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="transparent"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00e5ff', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }} />
                    
                    <Area
                        type="monotone"
                        dataKey="vulnerabilities"
                        name="Vulnerabilities"
                        fill="url(#vulnGradient)"
                        stroke="#00e5ff"
                        strokeWidth={2}
                        activeDot={{ r: 6, fill: '#00e5ff', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                    
                    <Line
                        type="monotone"
                        dataKey="riskLevel"
                        name="Risk Level"
                        stroke="#334155"
                        strokeWidth={2}
                        dot={(props) => {
                            const { cx, cy, payload, key } = props;
                            if (cx == null || cy == null) return null;
                            return (
                                <circle
                                    key={key}
                                    cx={cx}
                                    cy={cy}
                                    r={5}
                                    fill={getRiskColor(payload.riskLevel)}
                                    stroke="#0f172a"
                                    strokeWidth={2}
                                />
                            );
                        }}
                        activeDot={(props) => {
                            const { cx, cy, payload, key } = props;
                            if (cx == null || cy == null) return null;
                            return (
                                <circle
                                    key={key}
                                    cx={cx}
                                    cy={cy}
                                    r={8}
                                    fill={getRiskColor(payload.riskLevel)}
                                    stroke="#fff"
                                    strokeWidth={2}
                                    style={{ filter: `drop-shadow(0px 0px 8px ${getRiskColor(payload.riskLevel)})` }}
                                />
                            );
                        }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    )
}
