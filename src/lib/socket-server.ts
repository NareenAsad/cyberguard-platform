import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { mockDataGenerator } from './mock-data-generator'

let io: SocketIOServer | null = null
let dataGenerator: NodeJS.Timeout | null = null

export function initSocketServer(httpServer: HTTPServer) {
    if (io) return io

    io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })

    io.on('connection', (socket) => {
        console.log('[Socket Server] Client connected:', socket.id)

        // Send initial data
        socket.emit('metrics:update', mockDataGenerator.generateMetrics())

        socket.on('disconnect', () => {
            console.log('[Socket Server] Client disconnected:', socket.id)
        })

        socket.on('error', (error) => {
            console.error('[Socket Server] Error:', error)
        })
    })

    startDataStream()

    return io
}

function startDataStream() {
    if (dataGenerator) return // prevent duplicate intervals

    dataGenerator = setInterval(() => {
        if (!io) return

        io.emit('metrics:update', mockDataGenerator.generateMetrics())

        if (Math.random() < 0.3) {
            io.emit('threats:new', mockDataGenerator.generateThreat())
        }

        if (Math.random() < 0.2) {
            io.emit('incidents:update', mockDataGenerator.generateIncidentUpdate())
        }

        io.emit('chart:update', mockDataGenerator.generateChartPoint())
    }, 10000)
}

export function getSocketServer(): SocketIOServer | null {
    return io
}

export function stopDataStream() {
    if (dataGenerator) {
        clearInterval(dataGenerator)
        dataGenerator = null
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('[Socket Server] Shutting down...')
    stopDataStream()
    process.exit()
})