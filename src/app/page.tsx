'use client'

import { useCallback, useMemo } from 'react'
import { ThreatChart } from '@/components/threats/threat-chart'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentIncidents } from '@/components/dashboard/recent-incidents'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardAPI, incidentAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'
import {
  useSocketMetrics,
  useSocketChartData,
  useSocketIncidents,
} from '@/hooks/use-socket-events'

export default function DashboardPage() {
  // API callbacks
  const metricsCallback = useCallback(() => dashboardAPI.getMetrics(), [])
  const chartCallback = useCallback(() => dashboardAPI.getChartData('6m'), [])
  const incidentsCallback = useCallback(() => incidentAPI.getIncidents({ limit: 3 }), [])

  // Initial API fetch
  const { data: initialMetrics, loading: metricsLoading } = useFetchData(metricsCallback, {
    refetchInterval: 0,
  })

  const { data: initialChartData, loading: chartLoading } = useFetchData(chartCallback, {
    refetchInterval: 0,
  })

  const { data: initialIncidents, loading: incidentsLoading } = useFetchData(incidentsCallback, {
    refetchInterval: 0,
  })

  // Real-time socket data
  const { metrics: socketMetrics, isConnected } = useSocketMetrics(initialMetrics)
  const socketChartData = useSocketChartData(initialChartData)
  const { incidents: socketIncidents } = useSocketIncidents(initialIncidents)

  // Smart fallbacks
  const displayMetrics = useMemo(
    () =>
      socketMetrics ||
      initialMetrics || {
        threatsDetected: 0,
        threatsDetectedChange: 0,
        riskScore: 0,
        riskScoreChange: 0,
        incidentsActive: 0,
        incidentsActiveChange: 0,
        systemsMonitored: 0,
        systemsMonitoredChange: 0,
      },
    [socketMetrics, initialMetrics]
  )

  const displayChartData = useMemo(
    () =>
      socketChartData && socketChartData.length > 0
        ? socketChartData
        : initialChartData,
    [socketChartData, initialChartData]
  )

  const displayIncidents = useMemo(
    () =>
      socketIncidents && socketIncidents.length > 0
        ? socketIncidents
        : initialIncidents || [],
    [socketIncidents, initialIncidents]
  )

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Real-time security monitoring and threat detection"
      />

      {/* Metrics with real-time indicator */}
      <MetricsGrid
        metrics={displayMetrics}
        loading={metricsLoading && !socketMetrics}
        isLive={isConnected}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          {chartLoading && !displayChartData ? (
            <Skeleton className="h-80" />
          ) : displayChartData ? (
            <ThreatChart data={displayChartData} />
          ) : null}
        </div>

        <QuickStats />
      </div>

      <RecentIncidents
        incidents={displayIncidents}
        loading={incidentsLoading && !socketIncidents}
      />
    </div>
  )
}