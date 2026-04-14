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
        const result = await sql`SELECT * FROM "DashboardMetric" LIMIT 1`
        return { success: true, data: result[0] || null }
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
