/* eslint-disable @typescript-eslint/no-explicit-any */
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

// ── Singleton Socket Instance ─────────────────────────────────────────────────
// One connection is shared across the entire client app.
// Connecting with { autoConnect: false } means we connect explicitly on first
// initSocket() call so the module import itself never triggers a connection.

let socket: Socket | null = null

export function initSocket(): Socket {
    if (!socket) {
        socket = io({
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            autoConnect: true,
        })

        socket.on('connect', () => {
            console.log('[Socket.io] Connected — id:', socket?.id)
        })

        socket.on('disconnect', (reason) => {
            console.log('[Socket.io] Disconnected —', reason)
        })

        socket.on('connect_error', (err) => {
            console.warn('[Socket.io] Connection error:', err.message)
        })
    }
    return socket
}

export function getSocket(): Socket | null {
    return socket
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
    }
}

// ── Typed Event Subscriptions ─────────────────────────────────────────────────
// Each helper returns an unsubscribe function for use in useEffect cleanups.

export function onMetricsUpdate(callback: (data: any) => void): () => void {
    const sock = initSocket()
    sock.on('metrics:update', callback)
    return () => sock.off('metrics:update', callback)
}

export function onNewThreat(callback: (data: any) => void): () => void {
    const sock = initSocket()
    sock.on('threats:new', callback)
    return () => sock.off('threats:new', callback)
}

export function onIncidentUpdate(callback: (data: any) => void): () => void {
    const sock = initSocket()
    sock.on('incidents:update', callback)
    return () => sock.off('incidents:update', callback)
}

export function onChartUpdate(callback: (data: any) => void): () => void {
    const sock = initSocket()
    sock.on('chart:update', callback)
    return () => sock.off('chart:update', callback)
}

export function onPageRefresh(callback: (data: any) => void): () => void {
    const sock = initSocket()
    sock.on('page:refresh', callback)
    return () => sock.off('page:refresh', callback)
}

export function onAlert(callback: (data: any) => void): () => void {
    const sock = initSocket()
    sock.on('alert:new', callback)
    return () => sock.off('alert:new', callback)
}