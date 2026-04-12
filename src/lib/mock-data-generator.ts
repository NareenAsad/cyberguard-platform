// Mock data generator for real-time WebSocket updates
import { mockData } from './mock-data'

const THREAT_TYPES = ['Malware', 'Phishing', 'DDoS', 'SQL Injection', 'XSS', 'Zero-Day', 'Ransomware']
const THREAT_SOURCES = [
    'External Network',
    'Internal Network',
    'Cloud Services',
    'Third-party Integration',
    'Unknown Origin',
]
const INCIDENT_STATUSES = ['Open', 'In Progress', 'Resolved', 'On Hold']
const AFFECTED_SYSTEMS = [
    'Web Server',
    'Database Server',
    'Mail Server',
    'DNS Server',
    'File Server',
    'API Gateway',
]

let lastMetrics = {
    threatsDetected: 1247,
    threatsDetectedChange: 0,
    riskScore: 73,
    riskScoreChange: 0,
    incidentsActive: 8,
    incidentsActiveChange: 0,
    systemsMonitored: 145,
    systemsMonitoredChange: 0,
}

let chartDataPoints: Array<{
    name: string
    threats: number
    detected: number
}> = mockData.chartData || []

export const mockDataGenerator = {
    generateMetrics() {
        // Simulate random metric changes
        const metrics = {
            threatsDetected: lastMetrics.threatsDetected + Math.floor(Math.random() * 10 - 3),
            threatsDetectedChange: Math.floor(Math.random() * 20 - 10),
            riskScore: Math.max(0, Math.min(100, lastMetrics.riskScore + Math.floor(Math.random() * 6 - 3))),
            riskScoreChange: Math.floor(Math.random() * 8 - 4),
            incidentsActive: Math.max(0, lastMetrics.incidentsActive + Math.floor(Math.random() * 3 - 1)),
            incidentsActiveChange: Math.floor(Math.random() * 4 - 2),
            systemsMonitored: lastMetrics.systemsMonitored,
            systemsMonitoredChange: 0,
        }

        lastMetrics = metrics
        return metrics
    },

    generateThreat() {
        const threatType = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)]
        const source = THREAT_SOURCES[Math.floor(Math.random() * THREAT_SOURCES.length)]
        const severity = ['Critical', 'High', 'Medium', 'Low'][
            Math.floor(Math.random() * 4)
        ]

        return {
            id: `threat-${Date.now()}`,
            type: threatType,
            severity,
            source,
            timestamp: new Date().toISOString(),
            description: `New ${threatType} threat detected from ${source}`,
            status: 'Active',
            affectedSystems: Math.floor(Math.random() * 5) + 1,
        }
    },

    generateIncidentUpdate() {
        const status = INCIDENT_STATUSES[Math.floor(Math.random() * INCIDENT_STATUSES.length)]
        const affectedSystem = AFFECTED_SYSTEMS[
            Math.floor(Math.random() * AFFECTED_SYSTEMS.length)
        ]

        return {
            id: `incident-${Math.floor(Math.random() * 1000)}`,
            title: `Incident on ${affectedSystem}`,
            status,
            severity: ['Critical', 'High', 'Medium'][Math.floor(Math.random() * 3)],
            affectedSystem,
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    },

    generateChartPoint() {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const name = `${hours}:${minutes}`

        const threats = Math.floor(Math.random() * 150) + 50
        const detected = Math.floor(threats * (0.75 + Math.random() * 0.25))

        return {
            name,
            threats,
            detected,
            timestamp: now.toISOString(),
        }
    },

    getLastMetrics() {
        return lastMetrics
    },
}
