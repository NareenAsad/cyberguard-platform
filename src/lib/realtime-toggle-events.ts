'use client'

/**
 * Shared client-side state for the dashboard's Real-Time Monitoring toggle.
 *
 * The toggle itself lives in the Dashboard page's local state, but other
 * components (e.g. the Sidebar's "Last Update" timestamp) need to know
 * whether it's paused too. localStorage persists the value across reloads;
 * the custom event lets already-mounted components react immediately when
 * the toggle is flipped, without a full page refresh.
 */

export const REALTIME_ENABLED_STORAGE_KEY = 'cyberguard:realtime-enabled'
const REALTIME_TOGGLE_EVENT = 'cyberguard:realtime-toggle'

export function getStoredRealtimeEnabled(defaultValue = true): boolean {
    if (typeof window === 'undefined') return defaultValue
    const stored = localStorage.getItem(REALTIME_ENABLED_STORAGE_KEY)
    return stored === null ? defaultValue : stored === 'true'
}

export function setStoredRealtimeEnabled(enabled: boolean): void {
    localStorage.setItem(REALTIME_ENABLED_STORAGE_KEY, String(enabled))
    window.dispatchEvent(new CustomEvent<boolean>(REALTIME_TOGGLE_EVENT, { detail: enabled }))
}

export function onRealtimeToggle(callback: (enabled: boolean) => void): () => void {
    const handler = (e: Event) => callback((e as CustomEvent<boolean>).detail)
    window.addEventListener(REALTIME_TOGGLE_EVENT, handler)
    return () => window.removeEventListener(REALTIME_TOGGLE_EVENT, handler)
}
