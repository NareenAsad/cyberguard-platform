'use client'

import { useCallback } from 'react'
import { ThreatChart } from '@/components/threats/threat-chart'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentIncidents } from '@/components/dashboard/recent-incidents'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardAPI, incidentAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'

export default function DashboardPage() {
  const metricsCallback = useCallback(() => dashboardAPI.getMetrics(), [])
  const chartCallback = useCallback(() => dashboardAPI.getChartData('6m'), [])
  const incidentsCallback = useCallback(() => incidentAPI.getIncidents({ limit: 3 }), [])

  const { data: metrics, loading: metricsLoading } = useFetchData(metricsCallback, {
    refetchInterval: 30000,
  })
  const { data: chartData, loading: chartLoading } = useFetchData(chartCallback, {
    refetchInterval: 60000,
  })
  const { data: incidents, loading: incidentsLoading } = useFetchData(incidentsCallback, {
    refetchInterval: 45000,
  })

  const displayMetrics = metrics || {
    threatsDetected: 0,
    threatsDetectedChange: 0,
    riskScore: 0,
    riskScoreChange: 0,
    incidentsActive: 0,
    incidentsActiveChange: 0,
    systemsMonitored: 0,
    systemsMonitoredChange: 0,
  }

  const displayIncidents = incidents || []

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Real-time security monitoring and threat detection"
      />

      <MetricsGrid metrics={displayMetrics} loading={metricsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          {chartLoading ? (
            <Skeleton className="h-80" />
          ) : chartData ? (
            <ThreatChart data={chartData} />
          ) : null}
        </div>
        <QuickStats />
      </div>

      <RecentIncidents incidents={displayIncidents} loading={incidentsLoading} />
    </div>
  )
}
