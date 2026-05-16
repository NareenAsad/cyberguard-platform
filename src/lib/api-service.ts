// Common fetch config
const fetchConfig = {
    next: { revalidate: 30 }, // cache for 30 seconds
}

// Dashboard APIs
export const dashboardAPI = {
    getMetrics: async () => {
        const response = await fetch('/api/dashboard/metrics', fetchConfig)
        const json = await response.json()
        const d = json.data

        if (!d) return { success: false, error: 'No metrics available' }

        // Map nested DB shape → flat shape expected by MetricsGrid
        const mapped = {
            threatsDetected: d.threats?.total ?? 0,
            threatsDetectedChange: d.threats?.last24h ?? 0,
            riskScore: d.risks?.avgScore ?? 0,
            riskScoreChange: d.risks?.critical ?? 0,
            incidentsActive: d.incidents?.open ?? 0,
            incidentsActiveChange: d.incidents?.last24h ?? 0,
            systemsMonitored: d.risks?.total ?? 0,
            systemsMonitoredChange: 0,
            // raw sub-objects
            threats: d.threats,
            incidents: d.incidents,
            risks: d.risks,
            postureScore: d.postureScore,
            postureLabel: d.postureLabel,
            recentThreats: d.recentThreats,
            recentIncidents: d.recentIncidents,
        }
        return { success: true, data: mapped }
    },

    getChartData: async (timeRange = '6m') => {
        const response = await fetch(
            `/api/dashboard/chart-data?timeRange=${timeRange}`,
            fetchConfig
        )
        const json = await response.json()
        // useFetchData expects { success, data }
        return { success: !!json.data, data: json.data ?? [] }
    },
}

// Threats APIs
export const threatsAPI = {
    getThreats: async (filters?: {
        severity?: string
        status?: string
        page?: number
        limit?: number
    }) => {
        const params = new URLSearchParams()
        if (filters?.severity) params.append('severity', filters.severity)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await fetch(`/api/threats?${params.toString()}`, fetchConfig)
        const json = await response.json()
        return json.data
    },
}

// Risk Analysis APIs
export const riskAPI = {
    getRisks: async (filters?: {
        minRisk?: number
        maxRisk?: number
        sortBy?: string
        order?: 'asc' | 'desc'
    }) => {
        const params = new URLSearchParams()
        if (filters?.minRisk !== undefined)
            params.append('minRisk', filters.minRisk.toString())
        if (filters?.maxRisk !== undefined)
            params.append('maxRisk', filters.maxRisk.toString())
        if (filters?.sortBy) params.append('sortBy', filters.sortBy)
        if (filters?.order) params.append('order', filters.order)

        const response = await fetch(
            `/api/risk-analysis?${params.toString()}`,
            fetchConfig
        )
        const json = await response.json()
        return json.data
    },
}

// Incident Response APIs
export const incidentAPI = {
    getIncidents: async (filters?: {
        status?: string
        severity?: string
        page?: number
        limit?: number
    }) => {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.severity) params.append('severity', filters.severity)
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await fetch(
            `/api/incident-response?${params.toString()}`,
            fetchConfig
        )
        const json = await response.json()
        return json.data  // raw array, consistent with other API methods
    },

    createIncident: async (incident: any) => {
        const response = await fetch('/api/incident-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incident),
        })
        const json = await response.json()
        return json.data
    },

    deleteIncident: async (id: string) => {
        const response = await fetch(`/api/incident-response?id=${id}`, {
            method: 'DELETE',
        })
        return await response.json()
    },
}

// Playbooks APIs
export const playbooksAPI = {
    getPlaybooks: async (filters?: {
        category?: string
        search?: string
        page?: number
        limit?: number
    }) => {
        const params = new URLSearchParams()
        if (filters?.category) params.append('category', filters.category)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await fetch(
            `/api/playbooks?${params.toString()}`,
            fetchConfig
        )
        const json = await response.json()
        return json.data
    },

    createPlaybook: async (playbook: {
        title: string
        description: string
        category: string
        steps: number
    }) => {
        const response = await fetch('/api/playbooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(playbook),
        })
        const json = await response.json()
        return json
    },

    deletePlaybook: async (id: string) => {
        const response = await fetch(`/api/playbooks?id=${id}`, {
            method: 'DELETE',
        })
        return await response.json()
    },
}

// Reports APIs
export const reportsAPI = {
    getReports: async (filters?: {
        type?: string
        status?: string
        page?: number
        limit?: number
    }) => {
        const params = new URLSearchParams()
        if (filters?.type) params.append('type', filters.type)
        if (filters?.status) params.append('status', filters.status)
        if (filters?.page) params.append('page', filters.page.toString())
        if (filters?.limit) params.append('limit', filters.limit.toString())

        const response = await fetch(
            `/api/reports?${params.toString()}`,
            fetchConfig
        )
        const json = await response.json()
        return json.data
    },

    createReport: async (report: any) => {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        })
        const json = await response.json()
        return json  // return full { success, data, error } so caller can inspect
    },

    deleteReport: async (id: string) => {
        const response = await fetch(`/api/reports?id=${id}`, {
            method: 'DELETE',
        })
        return await response.json()
    },
}