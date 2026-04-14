const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    // Create HTTP server
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error handling request:', err)
            res.statusCode = 500
            res.end('Internal server error')
        }
    })

    // Create Socket.io server
    const io = new Server(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })

    // Simulated metrics storage
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

    function generateMetrics() {
        const metrics = {
            threatsDetected: Math.max(0, lastMetrics.threatsDetected + Math.floor(Math.random() * 10 - 3)),
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
    }

    function generateThreat() {
        return {
            id: `threat-${Date.now()}`,
            type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
            severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
            source: THREAT_SOURCES[Math.floor(Math.random() * THREAT_SOURCES.length)],
            timestamp: new Date().toISOString(),
            status: 'Active',
            affectedSystems: Math.floor(Math.random() * 5) + 1,
        }
    }

    function generateIncidentUpdate() {
        return {
            id: `incident-${Math.floor(Math.random() * 1000)}`,
            title: `Incident on ${AFFECTED_SYSTEMS[Math.floor(Math.random() * AFFECTED_SYSTEMS.length)]}`,
            status: INCIDENT_STATUSES[Math.floor(Math.random() * INCIDENT_STATUSES.length)],
            severity: ['Critical', 'High', 'Medium'][Math.floor(Math.random() * 3)],
            timestamp: new Date().toISOString(),
        }
    }

    function generateChartPoint() {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const threats = Math.floor(Math.random() * 150) + 50
        const detected = Math.floor(threats * (0.75 + Math.random() * 0.25))

        return {
            name: `${hours}:${minutes}`,
            threats,
            detected,
            timestamp: now.toISOString(),
        }
    }

    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('[Socket.io] Client connected:', socket.id)

        // Send initial metrics to new client
        socket.emit('metrics:update', generateMetrics())

        socket.on('disconnect', () => {
            console.log('[Socket.io] Client disconnected:', socket.id)
        })

        socket.on('error', (error) => {
            console.error('[Socket.io] Socket error:', error)
        })
    })

    // Start broadcasting data to all connected clients
    setInterval(() => {
        io.emit('metrics:update', generateMetrics())

        if (Math.random() < 0.3) {
            io.emit('threats:new', generateThreat())
        }

        if (Math.random() < 0.2) {
            io.emit('incidents:update', generateIncidentUpdate())
        }

        io.emit('chart:update', generateChartPoint())
    }, 10000)

    httpServer.listen(port, (err) => {
        if (err) throw err
        console.log(`> Server ready on http://${hostname}:${port}`)
        console.log(`> Socket.io ready on ws://${hostname}:${port}/api/socket`)
    })
})
