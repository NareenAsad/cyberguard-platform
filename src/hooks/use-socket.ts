'use client'

import { useEffect, useState } from 'react'
import { initSocket } from '@/lib/socket/socket'
import type { Socket } from 'socket.io-client'

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        const sock = initSocket()
        setSocket(sock)
    }, [])

    return socket
}
