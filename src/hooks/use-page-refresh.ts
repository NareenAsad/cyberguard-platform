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

export function usePageRefresh(pageName: string, onRefresh?: () => void) {
    const router = useRouter()

    useEffect(() => {
        const handler = () => {
            console.log(`[PageRefresh] AI Analysis completed. Refreshing ${pageName}...`)
            if (onRefresh) {
                onRefresh()
            } else {
                router.refresh()   // re-runs Server Components and refetches data
            }
        }

        window.addEventListener('ai-analysis:completed', handler)
        return () => {
            window.removeEventListener('ai-analysis:completed', handler)
        }

    }, [pageName, router, onRefresh])
}
