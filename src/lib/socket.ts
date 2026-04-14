import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocket() {
    if (socket) return socket

    const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
    const host = window.location.host

    socket = io(`${protocol}//${host}`, {
        path: '/api/socket',
        addTrailingSlash: false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
        console.log('[Socket] Connected:', socket?.id)
    })

    socket.on('disconnect', () => {
        console.log('[Socket] Disconnected')
    })

    socket.on('error', (error) => {
        console.error('[Socket] Error:', error)
    })

    return socket
}

export function getSocket(): Socket | null {
    return socket
}

export function disconnectSocket() {
    if (socket) {
        socket.removeAllListeners() // cleanup all listeners
        socket.disconnect()
        socket = null
    }
}

// SAFE EVENT SUBSCRIPTIONS

export function onMetricsUpdate(callback: (data: any) => void) {
    const sock = socket || initSocket()

    sock.off('metrics:update')
    sock.on('metrics:update', callback)

    return () => sock.off('metrics:update', callback)
}

export function onNewThreat(callback: (data: any) => void) {
    const sock = socket || initSocket()

    sock.off('threats:new')
    sock.on('threats:new', callback)

    return () => sock.off('threats:new', callback)
}

export function onIncidentUpdate(callback: (data: any) => void) {
    const sock = socket || initSocket()

    sock.off('incidents:update')
    sock.on('incidents:update', callback)

    return () => sock.off('incidents:update', callback)
}

export function onChartUpdate(callback: (data: any) => void) {
    const sock = socket || initSocket()

    sock.off('chart:update')
    sock.on('chart:update', callback)

    return () => sock.off('chart:update', callback)
}