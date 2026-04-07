'use client'

import { useCallback } from 'react'
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react'
import { MetricCard } from '@/components/metric-card'
import { ThreatChart } from '@/components/threat-chart'
import { Skeleton } from '@/components/skeleton'
import { dashboardAPI, incidentAPI } from '@/lib/api-service'
import { useFetchData } from '@/hooks/use-fetch-data'

export default function DashboardPage() {
  const metricsCallback = useCallback(() => dashboardAPI.getMetrics(), [])
  const chartCallback = useCallback(() => dashboardAPI.getChartData('6m'), [])
  const incidentsCallback = useCallback(() => incidentAPI.getIncidents({ limit: 3 }), [])

  const { data: metrics, loading: metricsLoading } = useFetchData(metricsCallback, {
    refetchInterval: 30000, // Refetch every 30 seconds
  })
  const { data: chartData, loading: chartLoading } = useFetchData(chartCallback, {
    refetchInterval: 60000, // Refetch every 60 seconds
  })
  const { data: incidents, loading: incidentsLoading } = useFetchData(incidentsCallback, {
    refetchInterval: 45000, // Refetch every 45 seconds
  })

  // Fallback to defaults if data not loaded
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

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-sm md:text-base text-muted-foreground">Real-time security monitoring and threat detection</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metricsLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <MetricCard
              title="Threats Detected"
              value={displayMetrics.threatsDetected.toLocaleString()}
              change={displayMetrics.threatsDetectedChange}
              icon={<AlertTriangle className="w-8 h-8" />}
            />
            <MetricCard
              title="Risk Score"
              value={displayMetrics.riskScore}
              change={displayMetrics.riskScoreChange}
              unit="%"
              icon={<TrendingUp className="w-8 h-8" />}
            />
            <MetricCard
              title="Active Incidents"
              value={displayMetrics.incidentsActive}
              change={displayMetrics.incidentsActiveChange}
              icon={<Shield className="w-8 h-8" />}
            />
            <MetricCard
              title="Systems Monitored"
              value={displayMetrics.systemsMonitored}
              change={displayMetrics.systemsMonitoredChange}
              icon={<Activity className="w-8 h-8" />}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          {chartLoading ? (
            <Skeleton className="h-80" />
          ) : chartData ? (
            <ThreatChart data={chartData} />
          ) : null}
        </div>

        {/* Quick Stats */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Detection Rate</span>
              <span className="font-semibold text-foreground">77%</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">Response Time</span>
              <span className="font-semibold text-foreground">2.3 min</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border">
              <span className="text-sm text-muted-foreground">False Positives</span>
              <span className="font-semibold text-foreground">3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">System Uptime</span>
              <span className="font-semibold text-foreground">99.99%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Recent Incidents</h3>

        <div className="space-y-4">
          {incidentsLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : incidents && incidents.length > 0 ? (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{incident.title}</h4>
                    <p className="text-sm text-muted-foreground">{incident.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${incident.severity === 'critical'
                      ? 'bg-destructive/20 text-destructive'
                      : incident.severity === 'high'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{incident.description}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">{incident.assignee}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${incident.status === 'resolved'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-orange-500/20 text-orange-400'
                    }`}>
                    {incident.status === 'resolved' ? 'Resolved' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No incidents found</p>
          )}
        </div>
      </div>
    </div>
  )
}
