'use client'

import { useEffect } from 'react'
import { initSocket } from '@/lib/socket'

export function SocketInitializer() {
    useEffect(() => {
        // Initialize socket connection when app loads
        const socket = initSocket()

        return () => {
            // Optionally disconnect on unmount
            // disconnectSocket()
        }
    }, [])

    return null
}
