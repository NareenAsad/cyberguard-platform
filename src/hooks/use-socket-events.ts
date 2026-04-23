'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    initSocket,
    getSocket,
    onMetricsUpdate,
    onNewThreat,
    onIncidentUpdate,
    onChartUpdate,
} from '@/lib/socket/socket'

// Hook for subscribing to metrics updates
export function useSocketMetrics(initialData?: any) {
    const [metrics, setMetrics] = useState(initialData)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Initialize socket on mount
        const socket = initSocket()
        setIsConnected(socket.connected)

        // Listen for connection
        socket.on('connect', () => {
            console.log('[useSocketMetrics] Connected')
            setIsConnected(true)
        })

        socket.on('disconnect', () => {
            console.log('[useSocketMetrics] Disconnected')
            setIsConnected(false)
        })

        // Subscribe to metrics updates
        const unsubscribe = onMetricsUpdate((data) => {
            console.log('[useSocketMetrics] Received update:', data)
            setMetrics(data)
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return { metrics, isConnected }
}

// Hook for subscribing to new threats
export function useSocketThreats(initialData?: any[]) {
    const [threats, setThreats] = useState(initialData || [])
    const [latestThreat, setLatestThreat] = useState<any>(null)

    useEffect(() => {
        const socket = initSocket()

        const unsubscribe = onNewThreat((threat) => {
            console.log('[useSocketThreats] New threat:', threat)
            setLatestThreat(threat)
            setThreats((prev) => [threat, ...(prev || []).slice(0, 9)])
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return { threats, latestThreat }
}

// Hook for subscribing to incident updates
export function useSocketIncidents(initialData?: any[]) {
    const [incidents, setIncidents] = useState(initialData || [])
    const [latestIncident, setLatestIncident] = useState<any>(null)

    // Sync state when initialData arrives (async API fetch)
    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setIncidents(initialData)
        }
    }, [initialData])

    useEffect(() => {
        const socket = initSocket()

        const unsubscribe = onIncidentUpdate((incident) => {
            console.log('[useSocketIncidents] Incident update:', incident)
            setLatestIncident(incident)
            setIncidents((prev) => {
                const updated = prev ? [...prev] : []
                const existingIndex = updated.findIndex((i) => i.id === incident.id)
                if (existingIndex >= 0) {
                    updated[existingIndex] = incident
                } else {
                    updated.unshift(incident)
                }
                return updated.slice(0, 10)
            })
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return { incidents, latestIncident }
}

// Hook for subscribing to chart updates
export function useSocketChartData(initialData?: any[]) {
    const [chartData, setChartData] = useState(initialData || [])

    useEffect(() => {
        const socket = initSocket()

        const unsubscribe = onChartUpdate((dataPoint) => {
            console.log('[useSocketChartData] Chart update:', dataPoint)
            setChartData((prev) => {
                const updated = [...(prev || [])]
                // Keep last 30 data points
                updated.push(dataPoint)
                return updated.slice(-30)
            })
        })

        return () => {
            unsubscribe()
        }
    }, [])

    return chartData
}

// Hook to check if socket is connected
export function useSocketConnection() {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const socket = initSocket()
        setIsConnected(socket.connected)

        const handleConnect = () => {
            console.log('[useSocketConnection] Connected')
            setIsConnected(true)
        }

        const handleDisconnect = () => {
            console.log('[useSocketConnection] Disconnected')
            setIsConnected(false)
        }

        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)

        return () => {
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
        }
    }, [])

    return isConnected
}
