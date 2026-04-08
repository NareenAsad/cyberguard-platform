const USE_API = true // Set to false to use mock data fallback

interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    timestamp?: string
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total?: number
    page?: number
    pages?: number
    limit?: number
}

// Common fetch config
const fetchConfig = {
    next: { revalidate: 30 }, // cache for 30 seconds
}

// Dashboard APIs
export const dashboardAPI = {
    getMetrics: async () => {
        if (!USE_API) {
            const { dashboardMetrics } = await import('./mock-data')
            return dashboardMetrics
        }

        const response = await fetch('/api/dashboard/metrics', fetchConfig)
        const json = await response.json()
        return json.data
    },

    getChartData: async (timeRange = '6m') => {
        if (!USE_API) {
            const { chartData } = await import('./mock-data')
            return chartData
        }

        const response = await fetch(
            `/api/dashboard/chart-data?timeRange=${timeRange}`,
            fetchConfig
        )
        const json = await response.json()
        return json.data
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
        if (!USE_API) {
            const { threatData } = await import('./mock-data')
            return threatData
        }

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
        if (!USE_API) {
            const { riskAnalysis } = await import('./mock-data')
            return riskAnalysis
        }

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
        if (!USE_API) {
            const { incidents } = await import('./mock-data')
            return incidents
        }

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
        return json.data
    },

    createIncident: async (incident: any) => {
        if (!USE_API) {
            return incident
        }

        const response = await fetch('/api/incident-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incident),
        })
        const json = await response.json()
        return json.data
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
        if (!USE_API) {
            const { playbooks } = await import('./mock-data')
            return playbooks
        }

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
}

// Reports APIs
export const reportsAPI = {
    getReports: async (filters?: {
        type?: string
        status?: string
        page?: number
        limit?: number
    }) => {
        if (!USE_API) {
            const { reports } = await import('./mock-data')
            return reports
        }

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
        if (!USE_API) {
            return report
        }

        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report),
        })
        const json = await response.json()
        return json.data
    },
}