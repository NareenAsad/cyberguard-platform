/* eslint-disable */
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { Redis } = require('@upstash/redis')
const path = require('path')

try {
    const fs = require('fs')
    const envFile = path.resolve(__dirname, '.env.local')
    if (fs.existsSync(envFile)) {
        const lines = fs.readFileSync(envFile, 'utf-8').split(/\r?\n/)
        for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith('#')) continue
            const eqIdx = trimmed.indexOf('=')
            if (eqIdx === -1) continue
            const key = trimmed.slice(0, eqIdx).trim()
            let value = trimmed.slice(eqIdx + 1).trim()
            // Strip surrounding quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            // Only set if not already set by the shell environment
            if (!process.env[key]) process.env[key] = value
        }
        console.log('[Env] Loaded .env.local')
    }
} catch (e) {
    console.warn('[Env] Could not load .env.local:', e.message)
}

// ── Redis client (optional — falls back gracefully if env vars missing) ──────
let redis = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    console.log('[Redis] Connected to Upstash Redis')
} else {
    console.warn('[Redis] No Upstash credentials — lastMetrics stored in-memory only')
}

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

            // Internal webhook to bridge Next.js API routes with Socket.io
            if (req.method === 'POST' && parsedUrl.pathname === '/api/internal/socket-emit') {
                let body = ''
                req.on('data', chunk => body += chunk)
                req.on('end', () => {
                    try {
                        const payload = JSON.parse(body)
                        const { event, data } = payload

                        if (event === 'agent:complete') {
                            // Legacy handler
                            const result = data?.result || {}
                            if (result.threats?.length) io.emit('threats:new', result.threats)
                            if (result.risk_scores?.length) io.emit('metrics:update', result.risk_scores)
                            if (result.metrics) io.emit('metrics:update', { ...lastMetrics, ...result.metrics })

                        } else if (event === 'metrics:update') {
                            // Dashboard metric cards update — merge and persist
                            lastMetrics = { ...lastMetrics, ...data }
                            persistMetrics(lastMetrics)
                            io.emit('metrics:update', lastMetrics)

                        } else if (event === 'page:refresh') {
                            // Tell the specific page to refetch its data from the DB
                            // Frontend listens for this and calls router.refresh()
                            io.emit('page:refresh', data)
                            console.log(`[Socket] Page refresh triggered: ${data?.page}`)

                        } else if (event === 'alert:new') {
                            // Notification banner on dashboard
                            io.emit('alert:new', data)

                        } else {
                            // Generic passthrough
                            io.emit(event, data)
                        }

                        res.statusCode = 200
                        res.end('ok')
                    } catch (e) {
                        console.error('[Socket] Parse error:', e)
                        res.statusCode = 500
                        res.end('error')
                    }
                })
                return
            }

            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error handling request:', err)
            res.statusCode = 500
            res.end('Internal server error')
        }
    })

    // ── Real Socket.io Server ─────────────────────────────────────────────────
    const io = new Server(httpServer, {
        path: '/api/socket',
        cors: { origin: '*' },
        transports: ['websocket', 'polling'],
    })

    // Simulated metrics storage
    // Default values — overwritten by Redis on first read if data exists
    const DEFAULT_METRICS = {
        threatsDetected: 1247,
        threatsDetectedChange: 0,
        riskScore: 73,
        riskScoreChange: 0,
        incidentsActive: 8,
        incidentsActiveChange: 0,
        systemsMonitored: 145,
        systemsMonitoredChange: 0,
    }

    const REALTIME_KEY = 'realtime:metrics'
    let lastMetrics = { ...DEFAULT_METRICS }

        // Load persisted metrics from Redis at startup
        ; (async () => {
            if (redis) {
                try {
                    const stored = await redis.get(REALTIME_KEY)
                    if (stored) {
                        lastMetrics = typeof stored === 'string' ? JSON.parse(stored) : stored
                        console.log('[Redis] Loaded persisted metrics from Redis')
                    }
                } catch (e) {
                    console.error('[Redis] Failed to load metrics, using defaults:', e)
                }
            }
        })()

    /** Persist metrics to Redis (fire-and-forget, non-blocking) */
    function persistMetrics(metrics) {
        if (!redis) return
        redis.set(REALTIME_KEY, JSON.stringify(metrics), { ex: 86400 }) // 24h TTL
            .catch(e => console.error('[Redis] Failed to persist metrics:', e))
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
        // Persist updated metrics to Redis so they survive server restarts
        persistMetrics(metrics)
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

    // ── Socket.io connection handling ──────────────────────────────────────────
    io.on('connection', (socket) => {
        console.log('[Socket.io] Client connected:', socket.id)

        // Send initial metrics snapshot to the newly connected client
        socket.emit('metrics:update', generateMetrics())

        socket.on('disconnect', () => {
            console.log('[Socket.io] Client disconnected:', socket.id)
        })

        socket.on('error', (error) => {
            console.error('[Socket.io] Socket error:', error)
        })
    })

    // ── Live broadcasts ─────────────────────────────────────────────────────────
    // Push a new chart data point every 10 seconds to all connected clients
    setInterval(() => {
        io.emit('chart:update', generateChartPoint())
    }, 10000)

    // Push updated metrics every 30 seconds
    setInterval(() => {
        io.emit('metrics:update', generateMetrics())
    }, 30000)

    httpServer.listen(port, (err) => {
        if (err) throw err
        console.log(`> Server ready on http://${hostname}:${port}`)
        console.log(`> Socket.io ready on ws://${hostname}:${port}/api/socket`)
    })
})
