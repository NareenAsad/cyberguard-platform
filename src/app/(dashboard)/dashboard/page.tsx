'use client'

import { useCallback, useState } from 'react'
import { ThreatChart } from '@/components/threats/threat-chart'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentIncidents } from '@/components/dashboard/recent-incidents'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'
import { useSocketMetrics, useSocketChartData, useSocketIncidents } from '@/hooks/use-socket-events'
import { RunAnalysisButton } from '@/components/dashboard/run-analysis-button'

interface DashboardIncident {
    id: string
    title: string
    severity: string
    description: string
    assignee: string
    status: string
}

interface DashboardMetrics {
    threatsDetected: number
    threatsDetectedChange: number
    riskScore: number
    riskScoreChange: number
    incidentsActive: number
    incidentsActiveChange: number
    systemsMonitored: number
    systemsMonitoredChange: number
    recentIncidents?: DashboardIncident[]
}

interface ChartDataPoint {
    name: string
    threats: number
    detected: number
}

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState('24h')

    const metricsCallback = useCallback(() => dashboardAPI.getMetrics(), [])
    const chartCallback   = useCallback(() => dashboardAPI.getChartData(timeRange), [timeRange])

    const { data: initialMetrics,   loading: metricsLoading } = useFetchData<DashboardMetrics>(metricsCallback, { refetchInterval: 0 })
    const { data: initialChartData, loading: chartLoading   } = useFetchData<ChartDataPoint[]>(chartCallback,   { refetchInterval: 0 })

    const initialIncidents = initialMetrics?.recentIncidents ?? []

    const { metrics: socketMetrics }  = useSocketMetrics(initialMetrics ?? undefined)
    const socketChartData             = useSocketChartData(initialChartData ?? undefined)
    const { incidents: socketIncidents } = useSocketIncidents(initialIncidents)

    const displayMetrics = socketMetrics || initialMetrics || {
        threatsDetected: 0, threatsDetectedChange: 0,
        riskScore: 0,       riskScoreChange: 0,
        incidentsActive: 0, incidentsActiveChange: 0,
        systemsMonitored: 0, systemsMonitoredChange: 0,
    }

    const displayChartData = (socketChartData && socketChartData.length > 0)
        ? socketChartData
        : initialChartData

    const displayIncidents = ((socketIncidents && socketIncidents.length > 0) ? socketIncidents : null) ?? initialIncidents ?? []

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <PageHeader
                title="Dashboard"
                description="Real-time security monitoring and threat detection"
            />

            <RunAnalysisButton />

            <MetricsGrid 
                metrics={displayMetrics} 
                loading={metricsLoading && !socketMetrics} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-2">
                    {chartLoading && !displayChartData ? (
                        <Skeleton className="h-80" />
                    ) : displayChartData ? (
                        <ThreatChart data={displayChartData} onTimeRangeChange={setTimeRange} />
                    ) : null}
                </div>
                <QuickStats metrics={displayMetrics} />
            </div>

            <RecentIncidents incidents={displayIncidents} loading={metricsLoading && !socketMetrics} />
        </div>
    )
}
