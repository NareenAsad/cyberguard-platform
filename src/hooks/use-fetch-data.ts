'use client'

import { useState, useEffect } from 'react'

interface UseFetchDataOptions {
    enabled?: boolean
    refetchInterval?: number
    onError?: (error: Error) => void
}

interface UseFetchDataState<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

export function useFetchData<T>(
    fetchFn: () => Promise<any>,
    options: UseFetchDataOptions = {}
): UseFetchDataState<T> {
    const { enabled = true, refetchInterval, onError } = options
    const [state, setState] = useState<UseFetchDataState<T>>({
        data: null,
        loading: true,
        error: null,
    })

    useEffect(() => {
        if (!enabled) return

        let isMounted = true
        let intervalId: NodeJS.Timeout

        const fetchData = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }))
                const response = await fetchFn()

                if (!isMounted) return

                if (response.success) {
                    setState({
                        data: response.data,
                        loading: false,
                        error: null,
                    })
                } else {
                    const error = new Error(response.error || 'Unknown error')
                    setState({
                        data: null,
                        loading: false,
                        error,
                    })
                    onError?.(error)
                }
            } catch (err) {
                if (!isMounted) return

                const error = err instanceof Error ? err : new Error(String(err))
                setState({
                    data: null,
                    loading: false,
                    error,
                })
                onError?.(error)
            }
        }

        fetchData()

        if (refetchInterval) {
            intervalId = setInterval(fetchData, refetchInterval)
        }

        return () => {
            isMounted = false
            if (intervalId) clearInterval(intervalId)
        }
    }, [enabled, refetchInterval, onError, fetchFn])

    return state
}
