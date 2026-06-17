/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Socket } from 'socket.io-client'

const mockSocket: any = {
    on: () => mockSocket,
    off: () => mockSocket,
    emit: () => mockSocket,
    disconnect: () => mockSocket,
    connect: () => mockSocket,
    removeAllListeners: () => mockSocket,
    connected: false,
    id: 'mock-socket',
}

export function initSocket(): Socket {
    return mockSocket as any
}

export function getSocket(): Socket | null {
    return mockSocket as any
}

export function disconnectSocket() {
    // No-op
}

// SAFE EVENT SUBSCRIPTIONS

export function onMetricsUpdate(callback: (data: any) => void) {
    return () => {}
}

export function onNewThreat(callback: (data: any) => void) {
    return () => {}
}

export function onIncidentUpdate(callback: (data: any) => void) {
    return () => {}
}

export function onChartUpdate(callback: (data: any) => void) {
    return () => {}
}