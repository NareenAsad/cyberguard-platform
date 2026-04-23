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
        <div style={{
            background: 'rgba(6, 18, 46, 0.95)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}>
            <p style={{ color: 'rgba(148,163,184,0.7)', fontSize: 11, marginBottom: 4 }}>{label}</p>
            <p style={{ color: '#06b6d4', fontSize: 15, fontWeight: 700 }}>
                {payload[0]?.value} <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(148,163,184,0.6)' }}>threats</span>
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
        <div style={{
            background: 'linear-gradient(180deg, #0a1628 0%, #060e1e 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.07)',
            padding: '24px',
            height: '100%',
            minHeight: 320,
        }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h3 style={{ color: '#e8eaf6', fontSize: 18, fontWeight: 700, margin: 0 }}>Threat Activity</h3>
                    <p style={{ color: 'rgba(148,163,184,0.6)', fontSize: 12, marginTop: 4 }}>Real-time attack monitoring</p>
                </div>

                {/* Time range pills */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {TIME_RANGES.map(r => (
                        <button
                            key={r.value}
                            onClick={() => handleRangeChange(r.value)}
                            style={{
                                padding: '5px 14px',
                                borderRadius: 999,
                                fontSize: 13,
                                fontWeight: 600,
                                border: activeRange === r.value ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                background: activeRange === r.value
                                    ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
                                    : 'transparent',
                                color: activeRange === r.value ? '#fff' : 'rgba(148,163,184,0.6)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeRange === r.value ? '0 0 12px rgba(6,182,212,0.4)' : 'none',
                            }}
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
                            <stop offset="0%"   stopColor="#06b6d4" stopOpacity={0.45} />
                            <stop offset="60%"  stopColor="#06b6d4" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0}    />
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
                        cursor={{ stroke: 'rgba(6,182,212,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    <Area
                        type="monotoneX"
                        dataKey="threats"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fill="url(#cyanGrad)"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: '#06b6d4',
                            stroke: 'rgba(6,182,212,0.3)',
                            strokeWidth: 6,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
