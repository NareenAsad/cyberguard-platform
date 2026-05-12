'use client'

import { useState } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface ThreatChartProps {
    data: Array<{
        name: string
        threats?: number
        blocked?: number
        detected?: number
    }>
    onTimeRangeChange?: (range: string) => void
}

const TIME_RANGES = [
    { label: '24h', value: '24h' },
    { label: '7d',  value: '7d'  },
    { label: '30d', value: '30d' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-popover/95 border border-emerald-500/20 rounded-lg px-3.5 py-2.5 shadow-xl">
            <p className="text-muted-foreground text-xs mb-1">{label}</p>
            <p className="text-emerald-500 text-sm font-bold">
                {payload[0]?.value} <span className="text-xs font-normal text-muted-foreground">threats</span>
            </p>
        </div>
    )
}

export function ThreatChart({ data, onTimeRangeChange }: ThreatChartProps) {
    const [activeRange, setActiveRange] = useState('24h')

    const handleRangeChange = (range: string) => {
        setActiveRange(range)
        onTimeRangeChange?.(range)
    }

    // Normalize data — single threats value
    const chartData = data.map(d => ({
        name: d.name,
        threats: d.threats ?? d.detected ?? 0,
    }))

    return (
        <div className="bg-card rounded-2xl border border-border p-6 h-full min-h-[320px]">
            {/* Header row */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-foreground text-lg font-bold m-0">Threat Activity</h3>
                    <p className="text-muted-foreground text-xs mt-1">Real-time attack monitoring</p>
                </div>

                {/* Time range pills */}
                <div className="flex gap-1.5">
                    {TIME_RANGES.map(r => (
                        <button
                            key={r.value}
                            onClick={() => handleRangeChange(r.value)}
                            className={`px-3.5 py-1 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                                activeRange === r.value
                                    ? 'border-transparent bg-gradient-to-br from-emerald-600 to-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                    : 'border border-border bg-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#10b981" stopOpacity={0.45} />
                            <stop offset="60%"  stopColor="#10b981" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0}    />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                        vertical={true}
                        horizontal={true}
                    />

                    <XAxis
                        dataKey="name"
                        stroke="transparent"
                        tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.45)' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="transparent"
                        tick={{ fontSize: 11, fill: 'rgba(148,163,184,0.45)' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        width={35}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: 'rgba(16,185,129,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    <Area
                        type="monotoneX"
                        dataKey="threats"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#cyanGrad)"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#10b981',
                            stroke: 'rgba(16,185,129,0.3)',
                            strokeWidth: 6,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
