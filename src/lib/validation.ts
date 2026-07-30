import { z } from 'zod'

export function sanitizeString(val: string): string {
    return val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
}

// ── 1. Threats Validation Schemas ───────────────────────────────────────────

export const threatIndicatorSchema = z.object({
    type: z.enum(['ip', 'domain', 'hash', 'cve', 'url']),
    value: z.string().trim().min(1).max(256).transform(sanitizeString),
    source: z.string().trim().min(1).max(100).transform(sanitizeString),
    confidence: z.number().min(0).max(100).optional(),
}).strict()

export const threatAssetSchema = z.object({
    id: z.string().trim().min(1).max(50).transform(sanitizeString),
    name: z.string().trim().min(1).max(100).transform(sanitizeString),
    type: z.string().trim().max(50).transform(sanitizeString).optional(),
    ip_address: z.string().trim().max(50).transform(sanitizeString).optional(),
    os: z.string().trim().max(50).transform(sanitizeString).optional(),
    software: z.array(
        z.object({
            name: z.string().trim().max(100).transform(sanitizeString),
            version: z.string().trim().max(50).transform(sanitizeString),
        }).strict()
    ).optional(),
    criticality: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    network_exposure: z.enum(['internet-facing', 'internal', 'air-gapped']).optional(),
    owner: z.string().trim().max(100).transform(sanitizeString).optional(),
}).strict()

export const threatsPostSchema = z.object({
    indicators: z.array(threatIndicatorSchema).min(1),
    assets: z.array(threatAssetSchema).min(1),
}).strict()

export const jobIdSchema = z.object({
    jobId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
}).strict()

// ── 2. Incident Validation Schemas ──────────────────────────────────────────

export const incidentPostSchema = z.object({
    title: z.string().trim().min(3).max(100).transform(sanitizeString),
    description: z.string().trim().min(5).max(1000).transform(sanitizeString),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    assignee: z.string().trim().min(1).max(100).transform(sanitizeString),
}).strict()

export const incidentPatchSchema = z.object({
    assignee: z.string().trim().min(1).max(100).transform(sanitizeString).optional(),
    status: z.enum(['open', 'in-progress', 'resolved']).optional(),
}).strict().refine(data => data.assignee !== undefined || data.status !== undefined, {
    message: "At least one of assignee or status is required for update",
})

// ── 3. Playbooks Validation Schemas ─────────────────────────────────────────

export const playbookPostSchema = z.object({
    title: z.string().trim().min(3).max(100).transform(sanitizeString),
    description: z.string().trim().min(5).max(1000).transform(sanitizeString),
    category: z.string().trim().min(2).max(50).transform(sanitizeString),
    steps: z.union([z.number(), z.string().transform(val => Number(val))])
        .pipe(z.number().min(0).max(100)),
}).strict()

// ── 4. Reports Validation Schemas ───────────────────────────────────────────

export const reportPostSchema = z.object({
    title: z.string().trim().min(3).max(100).transform(sanitizeString),
    type: z.string().trim().min(2).max(50).transform(sanitizeString),
    description: z.string().trim().max(1000).transform(sanitizeString).optional(),
}).strict()

// ── 5. Admin Asset Validation Schemas ────────────────────────────────────────

export const adminAssetPostSchema = z.object({
    name: z.string().trim().min(1).max(100).transform(sanitizeString),
    type: z.string().trim().min(1).max(50).transform(sanitizeString),
    ip_address: z.string().trim().max(50).transform(sanitizeString).optional(),
    os: z.string().trim().max(50).transform(sanitizeString).optional(),
    criticality: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    network_exposure: z.enum(['internet-facing', 'internal', 'air-gapped']).optional(),
    owner: z.string().trim().max(100).transform(sanitizeString).optional(),
    active: z.boolean().optional(),
}).strict()

// ── 6. Admin Data Sources Schemas ────────────────────────────────────────────

export const adminDataSourcePatchSchema = z.object({
    key: z.string().trim().min(1).max(100).transform(sanitizeString),
    api_key: z.string().trim().max(256).transform(sanitizeString).optional(),
    enabled: z.boolean().optional(),
}).strict()

// ── 7. Admin Audit Logs Schemas ──────────────────────────────────────────────

export const adminAuditLogPostSchema = z.object({
    action: z.string().trim().min(1).max(100).transform(sanitizeString),
    target_id: z.string().trim().max(100).transform(sanitizeString).optional(),
    target_type: z.string().trim().max(100).transform(sanitizeString).optional(),
    details: z.record(z.string(), z.any()).optional(),
}).strict()

// ── 8. Agent Pipeline Save Schema ────────────────────────────────────────────
export const agentsSavePostSchema = z.object({
    jobId: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),
    result: z.object({
        threats: z.array(z.record(z.string(), z.unknown())).max(200).optional(),
        risk_register: z.array(z.record(z.string(), z.unknown())).max(200).optional(),
        playbooks: z.array(z.record(z.string(), z.unknown())).max(200).optional(),
        executive_report: z.record(z.string(), z.unknown()).optional(),
        technical_report: z.record(z.string(), z.unknown()).optional(),
        compliance_report: z.record(z.string(), z.unknown()).optional(),
    }).strict(),
}).strict()
