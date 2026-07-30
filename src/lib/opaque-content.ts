type OpaqueWrapper = { __b64: true; data: string }

function isOpaqueWrapper(raw: unknown): raw is OpaqueWrapper {
    return (
        !!raw &&
        typeof raw === 'object' &&
        (raw as { __b64?: unknown }).__b64 === true &&
        typeof (raw as { data?: unknown }).data === 'string'
    )
}

function encodeOpaqueJson<T>(content: T): OpaqueWrapper {
    const json = JSON.stringify(content)
    const data = typeof Buffer !== 'undefined'
        ? Buffer.from(json, 'utf-8').toString('base64')
        : btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    return { __b64: true, data }
}

function decodeOpaqueJson<T>(raw: unknown): T | null {
    if (!raw || typeof raw !== 'object') return null

    if (isOpaqueWrapper(raw)) {
        try {
            const json = typeof Buffer !== 'undefined'
                ? Buffer.from(raw.data, 'base64').toString('utf-8')
                : new TextDecoder().decode(Uint8Array.from(atob(raw.data), c => c.charCodeAt(0)))
            return JSON.parse(json)
        } catch {
            return null
        }
    }

    return raw as T
}

// ── Report.content ──────────────────────────────────────────────────────
import type { ReportContentData } from '@/types/report'

export function encodeReportContent(content: ReportContentData): OpaqueWrapper {
    return encodeOpaqueJson(content)
}

export function decodeReportContent(raw: unknown): ReportContentData | null {
    return decodeOpaqueJson<ReportContentData>(raw)
}

// ── Playbook.content ────────────────────────────────────────────────────
export interface PlaybookContentData {
    steps?: number
    preparation?: Array<{ step: number; action: string; reasoning?: string; tool?: string }>
    identification?: Array<{ step: number; action: string; reasoning?: string; command?: string }>
    containment?: Array<{ step: number; action: string; reasoning?: string; command?: string }>
    eradication?: Array<{ step: number; action: string; reasoning?: string; command?: string }>
    recovery?: Array<{ step: number; action: string; reasoning?: string; verification?: string }>
    // Actual shape varies (e.g. lessons_learned entries are
    // {finding, improvement, control}, not step objects) — left loose
    // rather than modeling every variant the UI doesn't render.
    post_incident?: any[]
    lessons_learned?: any[]
    [key: string]: unknown
}

export function encodePlaybookContent(content: Record<string, unknown>): OpaqueWrapper {
    return encodeOpaqueJson(content)
}

export function decodePlaybookContent(raw: unknown): PlaybookContentData | null {
    return decodeOpaqueJson<PlaybookContentData>(raw)
}
