'use client'

/**
 * usePageRefresh
 * Listens for socket 'page:refresh' events and calls router.refresh()
 * when the event matches the current page.
 *
 * Usage — add to any page that should auto-refresh after AI analysis:
 *
 *   usePageRefresh('threats')
 *   usePageRefresh('risk-analysis')
 *   usePageRefresh('incident-response')
 *   usePageRefresh('playbooks')
 *   usePageRefresh('reports')
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/use-socket'

export function usePageRefresh(pageName: string) {
    const router = useRouter()
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        const handler = (data: { page: string }) => {
            if (data.page === pageName) {
                console.log(`[PageRefresh] Refreshing ${pageName}...`)
                router.refresh()   // re-runs Server Components and refetches data
            }
        }

        socket.on('page:refresh', handler)
        return () => { socket.off('page:refresh', handler) }

    }, [socket, pageName, router])
}
