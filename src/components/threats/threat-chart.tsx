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
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null

    const isTimeOnly = /^\d{2}:\d{2}$/.test(label ?? '')

    const labelWithYear = (() => {
        if (isTimeOnly) {
            const today = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            return `${today}, ${label}`
        }
        try {
            const parsed = new Date(`${label} ${new Date().getFullYear()}`)
            if (!isNaN(parsed.getTime())) {
                return parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            }
        } catch { }
        return label
    })()

    return (
        <div className="bg-popover/95 border border-primary/20 rounded-lg px-3.5 py-2.5">
            <p className="text-muted-foreground text-xs mb-1">{labelWithYear}</p>
            <p className="text-primary text-sm font-bold">
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
                            className={`px-3.5 py-1 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer ${activeRange === r.value
                                    ? 'bg-primary/10 text-primary border border-primary/20'
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
                            <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.25} />
                            <stop offset="60%" stopColor="#00e5ff" stopOpacity={0.05} />
                            <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
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
                        cursor={{ stroke: 'rgba(0,229,255,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    <Area
                        type="monotoneX"
                        dataKey="threats"
                        stroke="#00e5ff"
                        strokeWidth={2.5}
                        fill="url(#cyanGrad)"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#00e5ff',
                            stroke: 'rgba(0,229,255,0.3)',
                            strokeWidth: 6,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
