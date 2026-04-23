import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Validate database connection
export async function validateConnection() {
    try {
        const result = await sql`SELECT NOW()`
        return { success: true, data: result }
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
        let query = `SELECT * FROM "Threat"`
        const conditions = []
        const params = []

        if (filters?.severity) {
            conditions.push(`severity = $${conditions.length + 1}`)
            params.push(filters.severity)
        }

        if (filters?.status) {
            conditions.push(`status = $${conditions.length + 1}`)
            params.push(filters.status)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`
        }

        query += ` ORDER BY detected DESC`

        if (filters?.limit) {
            query += ` LIMIT ${filters.limit}`
        }
        if (filters?.page && filters?.limit) {
            query += ` OFFSET ${(filters.page - 1) * filters.limit}`
        }

        const result = await sql(query, params)
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
        let query = `SELECT * FROM "RiskAnalysis"`
        const conditions = []
        const params = []

        if (filters?.minRisk !== undefined) {
            conditions.push(`"riskLevel" >= $${conditions.length + 1}`)
            params.push(filters.minRisk)
        }

        if (filters?.maxRisk !== undefined) {
            conditions.push(`"riskLevel" <= $${conditions.length + 1}`)
            params.push(filters.maxRisk)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`
        }

        const sortBy = filters?.sortBy || 'riskLevel'
        const order = filters?.order?.toUpperCase() || 'DESC'
        query += ` ORDER BY "${sortBy}" ${order}`

        const result = await sql(query, params)
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
        let query = `SELECT * FROM "Incident"`
        const conditions = []
        const params = []

        if (filters?.status) {
            conditions.push(`status = $${conditions.length + 1}`)
            params.push(filters.status)
        }

        if (filters?.severity) {
            conditions.push(`severity = $${conditions.length + 1}`)
            params.push(filters.severity)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`
        }

        query += ` ORDER BY created DESC`

        if (filters?.limit) {
            query += ` LIMIT ${filters.limit}`
        }
        if (filters?.page && filters?.limit) {
            query += ` OFFSET ${(filters.page - 1) * filters.limit}`
        }

        const result = await sql(query, params)
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
        let query = `SELECT * FROM "Playbook"`
        const conditions = []
        const params = []

        if (filters?.category) {
            conditions.push(`category = $${conditions.length + 1}`)
            params.push(filters.category)
        }

        if (filters?.search) {
            conditions.push(`(title ILIKE $${conditions.length + 1} OR description ILIKE $${conditions.length + 2})`)
            params.push(`%${filters.search}%`, `%${filters.search}%`)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`
        }

        query += ` ORDER BY "lastUpdated" DESC`

        if (filters?.limit) {
            query += ` LIMIT ${filters.limit}`
        }
        if (filters?.page && filters?.limit) {
            query += ` OFFSET ${(filters.page - 1) * filters.limit}`
        }

        const result = await sql(query, params)
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
        let query = `SELECT * FROM "Report"`
        const conditions = []
        const params = []

        if (filters?.type) {
            conditions.push(`type = $${conditions.length + 1}`)
            params.push(filters.type)
        }

        if (filters?.status) {
            conditions.push(`status = $${conditions.length + 1}`)
            params.push(filters.status)
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`
        }

        query += ` ORDER BY generated DESC`

        if (filters?.limit) {
            query += ` LIMIT ${filters.limit}`
        }
        if (filters?.page && filters?.limit) {
            query += ` OFFSET ${(filters.page - 1) * filters.limit}`
        }

        const result = await sql(query, params)
        return { success: true, data: result }
    } catch (error) {
        console.error('Error fetching reports:', error)
        return { success: false, error }
    }
}

// Dashboard metrics query
export async function getDashboardMetrics() {
    try {
        // Run all metric queries in parallel for speed
        const [
            threatCounts,
            incidentCounts,
            riskStats,
            recentThreats,
            recentIncidents,
        ] = await Promise.all([

            // Total threats + breakdown by severity
            sql`
                SELECT
                    COUNT(*)::int                                              AS total,
                    COUNT(*) FILTER (WHERE severity = 'critical')::int        AS critical,
                    COUNT(*) FILTER (WHERE severity = 'high')::int            AS high,
                    COUNT(*) FILTER (WHERE severity = 'medium')::int          AS medium,
                    COUNT(*) FILTER (WHERE severity = 'low')::int             AS low,
                    COUNT(*) FILTER (WHERE status = 'active')::int            AS active,
                    COUNT(*) FILTER (WHERE status = 'resolved')::int          AS resolved,
                    COUNT(*) FILTER (
                        WHERE detected >= NOW() - INTERVAL '24 hours'
                    )::int AS last_24h
                FROM "Threat"
            `,

            // Incident counts + status breakdown
            sql`
                SELECT
                    COUNT(*)::int                                                    AS total,
                    COUNT(*) FILTER (WHERE status = 'open')::int                    AS open,
                    COUNT(*) FILTER (WHERE status = 'in-progress')::int             AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'resolved')::int                AS resolved,
                    COUNT(*) FILTER (WHERE severity = 'critical')::int              AS critical,
                    COUNT(*) FILTER (
                        WHERE created >= NOW() - INTERVAL '24 hours'
                    )::int AS last_24h
                FROM "Incident"
            `,

            // Risk score statistics
            sql`
                SELECT
                    COUNT(*)::int                                                        AS total,
                    ROUND(AVG("riskLevel")::numeric, 1)                                 AS avg_risk,
                    MAX("riskLevel")::int                                                AS max_risk,
                    COUNT(*) FILTER (WHERE "riskLevel" >= 70)::int                      AS critical_count,
                    COUNT(*) FILTER (WHERE "riskLevel" >= 50 AND "riskLevel" < 70)::int AS high_count,
                    COUNT(*) FILTER (WHERE "riskLevel" >= 30 AND "riskLevel" < 50)::int AS medium_count,
                    COUNT(*) FILTER (WHERE "riskLevel" < 30)::int                       AS low_count
                FROM "RiskAnalysis"
            `,

            // 5 most recent threats for the live feed
            sql`
                SELECT id, title, severity, status, detected, source
                FROM "Threat"
                ORDER BY detected DESC
                LIMIT 5
            `,

            // 5 most recent incidents
            sql`
                SELECT id, "incidentId", title, severity, status, created, assignee
                FROM "Incident"
                ORDER BY created DESC
                LIMIT 5
            `,
        ])

        const threats = threatCounts[0]
        const incidents = incidentCounts[0]
        const risks = riskStats[0]

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
            },
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

        const result = await sql`
      INSERT INTO "Incident" (
        id, "incidentId", title, description, severity, status, assignee, created, updated
      ) VALUES (
        ${Math.random().toString(36).substr(2, 9)},
        ${incidentId},
        ${incident.title},
        ${incident.description},
        ${incident.severity},
        'in-progress',
        ${incident.assignee},
        ${now},
        ${now}
      )
      RETURNING *
    `

        return { success: true, data: result[0] }
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

        const result = await sql`
            INSERT INTO "Playbook" (
                id, title, description, category, content, "lastUpdated", created
            ) VALUES (
                ${playbookId},
                ${playbook.title},
                ${playbook.description},
                ${playbook.category},
                ${content},
                ${now},
                ${now}
            )
            RETURNING *
        `

        return { success: true, data: result[0] }
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

        const result = await sql`
            INSERT INTO "Report" (
                id, title, type, status, content, "jobId", generated
            ) VALUES (
                ${reportId},
                ${report.title},
                ${report.type},
                'final',
                ${content},
                ${reportId},
                ${now}
            )
            RETURNING *
        `

        return { success: true, data: result[0] }
    } catch (error) {
        console.error('Error creating report:', error)
        return { success: false, error }
    }
}
