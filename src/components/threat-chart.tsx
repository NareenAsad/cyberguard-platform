'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ThreatChartProps {
  data: Array<{
    name: string
    threats: number
    detected: number
  }>
}

export function ThreatChart({ data }: ThreatChartProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Detection Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
            itemStyle={{ color: 'rgba(6, 182, 212, 1)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="threats"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Total Threats"
          />
          <Line
            type="monotone"
            dataKey="detected"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
            name="Detected & Blocked"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
