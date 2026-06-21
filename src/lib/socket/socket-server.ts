/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// ── Singleton Socket.io Server ────────────────────────────────────────────────
let io: SocketIOServer | null = null

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
    if (!io) {
        io = new SocketIOServer(httpServer, {
            path: '/api/socket',
            cors: { origin: '*' },
            transports: ['websocket', 'polling'],
        })

        io.on('connection', (socket) => {
            console.log('[Socket.io Server] Client connected:', socket.id)
            socket.on('disconnect', () => {
                console.log('[Socket.io Server] Client disconnected:', socket.id)
            })
        })

        console.log('[Socket.io Server] Initialized on path /api/socket')
    }
    return io
}

export function getSocketServer(): SocketIOServer | null {
    return io
}

export function stopDataStream() {
    // No-op — intervals managed in server.js
}

export function startDataStream() {
    // No-op — intervals managed in server.js
}