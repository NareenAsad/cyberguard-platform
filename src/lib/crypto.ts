import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

/**
 * AES-256-GCM helpers for encrypting sensitive values (third-party API keys,
 * etc.) before they are written to Supabase — so a database read (or a
 * leaked service-role key) doesn't hand over plaintext secrets.
 *
 * DATA_SOURCE_ENCRYPTION_KEY must be set in the server environment (never
 * NEXT_PUBLIC_*) — generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
    const secret = process.env.DATA_SOURCE_ENCRYPTION_KEY
    if (!secret) {
        throw new Error('DATA_SOURCE_ENCRYPTION_KEY is not set — cannot encrypt/decrypt secrets')
    }
    // Derive a 32-byte key regardless of the raw secret's length/format.
    return scryptSync(secret, 'cyberguard-data-source-secrets', 32)
}

/** Returns `iv:authTag:ciphertext`, all hex-encoded. */
export function encryptSecret(plaintext: string): string {
    const key = getKey()
    const iv = randomBytes(12)
    const cipher = createCipheriv(ALGORITHM, key, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(payload: string): string {
    const key = getKey()
    const [ivHex, authTagHex, dataHex] = payload.split(':')
    if (!ivHex || !authTagHex || !dataHex) {
        throw new Error('Malformed encrypted payload')
    }
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, 'hex')),
        decipher.final(),
    ])
    return decrypted.toString('utf8')
}
