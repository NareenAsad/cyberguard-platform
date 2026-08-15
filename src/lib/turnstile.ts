const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verifies a Cloudflare Turnstile token server-side. Must be called before
 * trusting any login/signup submission — the client-side widget alone proves
 * nothing, since the `cf-turnstile-response` field can simply be omitted or
 * forged in a direct POST that bypasses the browser widget entirely.
 */
export async function verifyTurnstileToken(token: string | null, remoteIp?: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY
    if (!secret) {
        // Fails closed in production; only skips verification in dev when
        // the key hasn't been configured yet (matches the widget's fallback).
        return process.env.NODE_ENV !== 'production'
    }
    if (!token) return false

    try {
        const body = new URLSearchParams({ secret, response: token })
        if (remoteIp) body.set('remoteip', remoteIp)

        const res = await fetch(VERIFY_URL, { method: 'POST', body })
        const data = await res.json()
        return data.success === true
    } catch (err) {
        console.error('[Turnstile] Verification request failed:', err)
        return false
    }
}
