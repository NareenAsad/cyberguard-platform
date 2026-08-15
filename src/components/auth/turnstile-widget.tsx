'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string
                    callback?: (token: string) => void
                    'expired-callback'?: () => void
                    'error-callback'?: () => void
                    theme?: 'light' | 'dark' | 'auto'
                    appearance?: 'always' | 'execute' | 'interaction-only'
                }
            ) => string
            reset: (widgetId?: string) => void
        }
    }
}

interface TurnstileWidgetProps {
    /** Called once a token is issued, and again with '' when it expires/errors. */
    onVerify?: (token: string) => void
}

/**
 * Cloudflare Turnstile bot-protection widget. Renders a hidden input named
 * `cf-turnstile-response` inside its container once solved — since this
 * component is placed inside a <form>, that field is picked up automatically
 * by `new FormData(form)`, no manual token plumbing required for submission.
 * `onVerify` is only used to drive UI state (e.g. disabling the submit button
 * until solved).
 */
export function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const widgetIdRef = useRef<string | null>(null)
    const [scriptLoaded, setScriptLoaded] = useState(false)

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    useEffect(() => {
        if (!scriptLoaded || !containerRef.current || !window.turnstile || !siteKey) return
        if (widgetIdRef.current) return // already rendered

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: 'dark',
            // Stays invisible for legitimate traffic — only renders a visible
            // box if Cloudflare actually needs an interactive challenge.
            appearance: 'interaction-only',
            callback: (token) => onVerify?.(token),
            'expired-callback': () => onVerify?.(''),
            'error-callback': () => onVerify?.(''),
        })
    }, [scriptLoaded, siteKey, onVerify])

    if (!siteKey) {
        // Fails closed in production (login/signup actions reject a missing
        // token server-side), but avoids breaking local dev when the key
        // hasn't been configured yet.
        if (process.env.NODE_ENV !== 'production') {
            return (
                <p className="text-xs text-muted-foreground/70 text-center">
                    NEXT_PUBLIC_TURNSTILE_SITE_KEY not set — bot protection disabled in dev
                </p>
            )
        }
        return null
    }

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
            />
            <div ref={containerRef} className="flex justify-center" />
        </>
    )
}
