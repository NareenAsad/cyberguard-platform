import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — deferred until first call so `next build` doesn't
// fail when env vars are not available in the build environment.
let _client: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
    if (_client) return _client

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error(
            'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.'
        )
    }

    _client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
    return _client
}

// Module-private proxy — keeps all existing `supabase.from(...)` calls
// working without any changes while deferring client creation to first use.
const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return getSupabaseClient()[prop as keyof SupabaseClient]
    },
})

// Validate database connection
export async function validateConnection() {
    try {
        const { error } = await supabase.from('Threat').select('id').limit(1)
        if (error) return { success: false, error }
        return { success: true, data: true }
    } catch (error) {
        console.error('Database connection error:', error)
        return { success: false, error }
    }
}

// Threat queries
export async function getThreats(filters?: {
    severity?: string
    status?: string
    page?: number
    limit?: number
}) {
    try {
        let query = supabase.from('Threat').select('*').order('detected', { ascending: false })
        if (filters?.severity) query = query.eq('severity', filters.severity)
        if (filters?.status) query = query.eq('status', filters.status)
        if (filters?.limit) {
            const page = filters.page ?? 1
            const from = (page - 1) * filters.limit
            query = query.range(from, from + filters.limit - 1)
        }
        const { data: result, error } = await query
        if (error) return { success: false, error }
        return { success: true, data: result }
    } catch (error) {
        console.error('Error fetching threats:', error)
        return { success: false, error }
    }
}

// Risk Analysis queries
export async function getRisks(filters?: {
    minRisk?: number
    maxRisk?: number
    sortBy?: string
    order?: 'asc' | 'desc'
}) {
    try {
        let query = supabase
            .from('RiskAnalysis')
            .select('*')
            .order(filters?.sortBy || 'riskLevel', { ascending: filters?.order === 'asc' })
        if (filters?.minRisk !== undefined) query = query.gte('riskLevel', filters.minRisk)
        if (filters?.maxRisk !== undefined) query = query.lte('riskLevel', filters.maxRisk)
        const { data: result, error } = await query
        if (error) return { success: false, error }
        return { success: true, data: result }
    } catch (error) {
        console.error('Error fetching risks:', error)
        return { success: false, error }
    }
}

// Incident queries
export async function getIncidents(filters?: {
    status?: string
    severity?: string
    page?: number
    limit?: number
}) {
    try {
        let query = supabase.from('Incident').select('*').order('created', { ascending: false })
        if (filters?.status) query = query.eq('status', filters.status)
        if (filters?.severity) query = query.eq('severity', filters.severity)
        if (filters?.limit) {
            const page = filters.page ?? 1
            const from = (page - 1) * filters.limit
            query = query.range(from, from + filters.limit - 1)
        }
        const { data: result, error } = await query
        if (error) return { success: false, error }
        return { success: true, data: result }
    } catch (error) {
        console.error('Error fetching incidents:', error)
        return { success: false, error }
    }
}

// Playbook queries
export async function getPlaybooks(filters?: {
    category?: string
    search?: string
    page?: number
    limit?: number
}) {
    try {
        let query = supabase.from('Playbook').select('*').order('lastUpdated', { ascending: false })
        if (filters?.category) query = query.eq('category', filters.category)
        if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        if (filters?.limit) {
            const page = filters.page ?? 1
            const from = (page - 1) * filters.limit
            query = query.range(from, from + filters.limit - 1)
        }
        const { data: result, error } = await query
        if (error) return { success: false, error }
        return { success: true, data: result }
    } catch (error) {
        console.error('Error fetching playbooks:', error)
        return { success: false, error }
    }
}

// Report queries
export async function getReports(filters?: {
    type?: string
    status?: string
    page?: number
    limit?: number
}) {
    try {
        let query = supabase.from('Report').select('*').order('generated', { ascending: false })
        if (filters?.type) query = query.eq('type', filters.type)
        if (filters?.status) query = query.eq('status', filters.status)
        if (filters?.limit) {
            const page = filters.page ?? 1
            const from = (page - 1) * filters.limit
            query = query.range(from, from + filters.limit - 1)
        }
        const { data: result, error } = await query
        if (error) return { success: false, error }
        return { success: true, data: result }
    } catch (error) {
        console.error('Error fetching reports:', error)
        return { success: false, error }
    }
}

// Dashboard metrics query
export async function getDashboardMetrics() {
    try {
            const now = Date.now()
            const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()

            const [
                threatsRes,
                incidentsRes,
                risksRes,
                recentThreatsRes,
                recentIncidentsRes,
            ] = await Promise.all([
                supabase.from('Threat').select('severity,status,detected'),
                supabase.from('Incident').select('severity,status,created'),
                supabase.from('RiskAnalysis').select('riskLevel'),
                supabase.from('Threat').select('id,title,severity,status,detected,source').order('detected', { ascending: false }).limit(5),
                supabase.from('Incident').select('id,incidentId,title,severity,status,created,assignee').order('created', { ascending: false }).limit(5),
            ])

            const queryError = threatsRes.error || incidentsRes.error || risksRes.error || recentThreatsRes.error || recentIncidentsRes.error
            if (queryError) {
                // Supabase reachable but app tables not created yet.
                if ((queryError as any)?.code === 'PGRST205') {
                    return {
                        success: true,
                        data: {
                            threats: { total: 0, critical: 0, high: 0, medium: 0, low: 0, active: 0, resolved: 0, last24h: 0 },
                            incidents: { total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0, last24h: 0 },
                            risks: { total: 0, avgScore: 0, maxScore: 0, critical: 0, high: 0, medium: 0, low: 0 },
                            postureScore: 100,
                            postureLabel: 'Good',
                            recentThreats: [],
                            recentIncidents: [],
                            generatedAt: new Date().toISOString(),
                            _warning: 'Using mock data - missing Supabase tables',
                        },
                    }
                }
                return { success: false, error: queryError }
            }

            const threatRows = threatsRes.data || []
            const incidentRows = incidentsRes.data || []
            const riskRows = risksRes.data || []
            const recentThreats = recentThreatsRes.data || []
            const recentIncidents = recentIncidentsRes.data || []

            const threats = {
                total: threatRows.length,
                critical: threatRows.filter((t: any) => t.severity === 'critical').length,
                high: threatRows.filter((t: any) => t.severity === 'high').length,
                medium: threatRows.filter((t: any) => t.severity === 'medium').length,
                low: threatRows.filter((t: any) => t.severity === 'low').length,
                active: threatRows.filter((t: any) => t.status === 'active').length,
                resolved: threatRows.filter((t: any) => t.status === 'resolved').length,
                last_24h: threatRows.filter((t: any) => t.detected && new Date(t.detected).toISOString() >= oneDayAgo).length,
            }

            const incidents = {
                total: incidentRows.length,
                open: incidentRows.filter((i: any) => i.status === 'open').length,
                in_progress: incidentRows.filter((i: any) => i.status === 'in-progress').length,
                resolved: incidentRows.filter((i: any) => i.status === 'resolved').length,
                critical: incidentRows.filter((i: any) => i.severity === 'critical').length,
                last_24h: incidentRows.filter((i: any) => i.created && new Date(i.created).toISOString() >= oneDayAgo).length,
            }

            const riskValues = riskRows.map((r: any) => Number(r.riskLevel) || 0)
            const risks = {
                total: riskValues.length,
                avg_risk: riskValues.length ? (riskValues.reduce((a: number, b: number) => a + b, 0) / riskValues.length).toFixed(1) : '0',
                max_risk: riskValues.length ? Math.max(...riskValues) : 0,
                critical_count: riskValues.filter((v: number) => v >= 70).length,
                high_count: riskValues.filter((v: number) => v >= 50 && v < 70).length,
                medium_count: riskValues.filter((v: number) => v >= 30 && v < 50).length,
                low_count: riskValues.filter((v: number) => v < 30).length,
            }

            // Compute overall security posture score (0–100, higher = safer)
            // Penalize heavily for critical/high findings
            const posturePenalty =
                (threats.critical * 10) +
                (threats.high * 5) +
                (incidents.critical * 8) +
                (risks.critical_count * 6)
            const postureScore = Math.max(0, 100 - posturePenalty)

        return {
            success: true,
            data: {
                    // Threat summary
                    threats: {
                        total: threats.total,
                        critical: threats.critical,
                        high: threats.high,
                        medium: threats.medium,
                        low: threats.low,
                        active: threats.active,
                        resolved: threats.resolved,
                        last24h: threats.last_24h,
                    },

                    // Incident summary
                    incidents: {
                        total: incidents.total,
                        open: incidents.open,
                        inProgress: incidents.in_progress,
                        resolved: incidents.resolved,
                        critical: incidents.critical,
                        last24h: incidents.last_24h,
                    },

                    // Risk summary
                    risks: {
                        total: risks.total,
                        avgScore: Number(risks.avg_risk) || 0,
                        maxScore: risks.max_risk || 0,
                        critical: risks.critical_count,
                        high: risks.high_count,
                        medium: risks.medium_count,
                        low: risks.low_count,
                    },

                    // Overall posture
                    postureScore,
                    postureLabel:
                        postureScore >= 80 ? 'Good' :
                            postureScore >= 60 ? 'Fair' :
                                postureScore >= 40 ? 'Poor' : 'Critical',

                    // Live feeds for dashboard widgets
                    recentThreats,
                    recentIncidents,

                    // Meta
                    generatedAt: new Date().toISOString(),
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error)
        return { success: false, error }
    }
}

// Create incident
export async function createIncident(incident: {
    title: string
    description: string
    severity: string
    assignee: string
}) {
    try {
        const incidentId = `INC-${Date.now()}`
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('Incident')
            .insert({
                id: Math.random().toString(36).substr(2, 9),
                incidentId,
                title: incident.title,
                description: incident.description,
                severity: incident.severity,
                status: 'in-progress',
                assignee: incident.assignee,
                created: now,
                updated: now,
            })
            .select('*')
            .single()
        if (error) return { success: false, error }
        return { success: true, data }
    } catch (error) {
        console.error('Error creating incident:', error)
        return { success: false, error }
    }
}

// Create playbook
export async function createPlaybook(playbook: {
    title: string
    description: string
    category: string
    steps: number
}) {
    try {
        const playbookId = `pb-${Date.now()}`
        const now = new Date().toISOString()
        // Store steps count in the jsonb content field
        const content = JSON.stringify({ steps: playbook.steps })

        const { data, error } = await supabase
            .from('Playbook')
            .insert({
                id: playbookId,
                title: playbook.title,
                description: playbook.description,
                category: playbook.category,
                content,
                lastUpdated: now,
                created: now,
            })
            .select('*')
            .single()
        if (error) return { success: false, error }
        return { success: true, data }
    } catch (error) {
        console.error('Error creating playbook:', error)
        return { success: false, error }
    }
}

// Create report
export async function createReport(report: {
    title: string
    type: string
    description?: string
}) {
    try {
        const reportId = `REP-${Date.now()}`
        const now = new Date().toISOString()
        // Store description inside the jsonb content field
        const content = report.description ? JSON.stringify({ description: report.description }) : null

        const { data, error } = await supabase
            .from('Report')
            .insert({
                id: reportId,
                title: report.title,
                type: report.type,
                status: 'final',
                content,
                jobId: reportId,
                generated: now,
            })
            .select('*')
            .single()
        if (error) return { success: false, error }
        return { success: true, data }
    } catch (error) {
        console.error('Error creating report:', error)
        return { success: false, error }
    }
}

// Update incident (assignee, status)
export async function updateIncident(id: string, updates: {
    assignee?: string
    status?: string
}) {
    try {
        const { data, error } = await supabase
            .from('Incident')
            .update({ ...updates, updated: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single()
        if (error) return { success: false, error }
        return { success: true, data }
    } catch (error) {
        console.error('Error updating incident:', error)
        return { success: false, error }
    }
}

// Delete functions
export async function deleteIncident(id: string) {
    try {
        const { error } = await supabase.from('Incident').delete().eq('id', id)
        if (error) return { success: false, error }
        return { success: true }
    } catch (error) {
        console.error('Error deleting incident:', error)
        return { success: false, error }
    }
}

export async function deletePlaybook(id: string) {
    try {
        const { error } = await supabase.from('Playbook').delete().eq('id', id)
        if (error) return { success: false, error }
        return { success: true }
    } catch (error) {
        console.error('Error deleting playbook:', error)
        return { success: false, error }
    }
}

export async function deleteReport(id: string) {
    try {
        const { error } = await supabase.from('Report').delete().eq('id', id)
        if (error) return { success: false, error }
        return { success: true }
    } catch (error) {
        console.error('Error deleting report:', error)
        return { success: false, error }
    }
}
