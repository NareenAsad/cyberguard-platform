'use client'

import { AlertTriangle, TrendingUp, Shield, Activity, Zap } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSocketConnection } from '@/hooks/use-socket-events'

interface MetricsGridProps {
    metrics: {
        threatsDetected: number
        threatsDetectedChange: number
        riskScore: number
        riskScoreChange: number
        incidentsActive: number
        incidentsActiveChange: number
        systemsMonitored: number
        systemsMonitoredChange: number
    }
    loading?: boolean
}

export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
    const isConnected = useSocketConnection()

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {isConnected && (
                <div className="flex items-center gap-2 text-sm text-green-400/80">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span>Live real-time updates enabled</span>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard
                    title="Threats Detected"
                    value={metrics.threatsDetected.toLocaleString()}
                    change={metrics.threatsDetectedChange}
                    icon={<AlertTriangle className="w-8 h-8" />}
                />
                <MetricCard
                    title="Risk Score"
                    value={metrics.riskScore}
                    change={metrics.riskScoreChange}
                    unit="%"
                    icon={<TrendingUp className="w-8 h-8" />}
                />
                <MetricCard
                    title="Active Incidents"
                    value={metrics.incidentsActive}
                    change={metrics.incidentsActiveChange}
                    icon={<Shield className="w-8 h-8" />}
                />
                <MetricCard
                    title="Systems Monitored"
                    value={metrics.systemsMonitored}
                    change={metrics.systemsMonitoredChange}
                    icon={<Activity className="w-8 h-8" />}
                />
            </div>
        </div>
    )
}
