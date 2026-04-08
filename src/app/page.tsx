'use client'

import { useCallback, useEffect, useState } from 'react'
import { ThreatChart } from '@/components/threats/threat-chart'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { RecentIncidents } from '@/components/dashboard/recent-incidents'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardAPI, incidentAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'
import { useMemo } from 'react'

export default function DashboardPage() {
  // Callbacks
  const metricsCallback = useCallback(() => dashboardAPI.getMetrics(), [])
  const chartCallback = useCallback(() => dashboardAPI.getChartData('6m'), [])
  const incidentsCallback = useCallback(() => incidentAPI.getIncidents({ limit: 3 }), [])

  // PRIMARY DATA (load immediately)
  const { data: metrics, loading: metricsLoading } = useFetchData(metricsCallback, {
    refetchInterval: 60000,
  })

  // SECONDARY DATA (lazy loaded)
  const [chartData, setChartData] = useState<any>(null)
  const [chartLoading, setChartLoading] = useState(true)

  const [incidents, setIncidents] = useState<any[]>([])
  const [incidentsLoading, setIncidentsLoading] = useState(true)

  useEffect(() => {
    const loadSecondaryData = async () => {
      try {
        const [chart, inc] = await Promise.all([
          chartCallback(),
          incidentsCallback(),
        ])
        setChartData(chart)
        setIncidents(inc)
      } catch (err) {
        console.error(err)
      } finally {
        setChartLoading(false)
        setIncidentsLoading(false)
      }
    }

    // Delay to prevent blocking initial render
    const timer = setTimeout(loadSecondaryData, 500)

    return () => clearTimeout(timer)
  }, [chartCallback, incidentsCallback])

  // Safe fallbacks
  const displayMetrics = useMemo(
    () =>
      metrics || {
        threatsDetected: 0,
        threatsDetectedChange: 0,
        riskScore: 0,
        riskScoreChange: 0,
        incidentsActive: 0,
        incidentsActiveChange: 0,
        systemsMonitored: 0,
        systemsMonitoredChange: 0,
      },
    [metrics]
  )

  const displayIncidents = useMemo(() => incidents || [], [incidents])

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Real-time security monitoring and threat detection"
      />

      {/* Metrics (loads first) */}
      <MetricsGrid metrics={displayMetrics} loading={metricsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Chart (lazy loaded) */}
        <div className="lg:col-span-2">
          {chartLoading ? (
            <Skeleton className="h-80" />
          ) : chartData ? (
            <ThreatChart data={chartData} />
          ) : null}
        </div>

        <QuickStats />
      </div>

      {/* Incidents (lazy loaded) */}
      <RecentIncidents incidents={displayIncidents} loading={incidentsLoading} />
    </div>
  )
}