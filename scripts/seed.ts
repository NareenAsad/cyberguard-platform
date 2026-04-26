/**
 * CyberGuard - Supabase seed script
 * Run: npx tsx scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
})

async function seed() {
    console.log('🌱 Seeding CyberGuard database (Supabase)...')

    const now = new Date().toISOString()
    const threats = [
        {
            id: 'thr-001',
            title: 'Log4Shell Remote Code Execution',
            description: 'Critical RCE vulnerability in Apache Log4j 2.',
            severity: 'critical',
            status: 'active',
            source: 'NVD',
            cveId: 'CVE-2021-44228',
            ipAddress: '45.33.32.156',
            detected: now,
        },
        {
            id: 'thr-002',
            title: 'SQL Injection Attempt on Login Endpoint',
            description: 'Repeated SQLi payloads detected on auth endpoint.',
            severity: 'high',
            status: 'investigating',
            source: 'AbuseIPDB',
            detected: now,
        },
    ]

    const { error: threatErr } = await supabase.from('Threat').upsert(threats, { onConflict: 'id' })
    if (threatErr) throw threatErr
    console.log('   ✅ Threats seeded')

    const reports = [
        { id: 'rep-001', title: 'Weekly Executive Security Summary', type: 'executive', status: 'final', generated: now },
        { id: 'rep-002', title: 'Technical Threat Intelligence Report', type: 'technical', status: 'final', generated: now },
    ]
    const { error: reportErr } = await supabase.from('Report').upsert(reports, { onConflict: 'id' })
    if (reportErr) throw reportErr
    console.log('   ✅ Reports seeded')

    console.log('✅ Seed complete')
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
