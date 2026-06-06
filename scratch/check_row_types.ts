import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
            if (match) {
                const key = match[1]
                let value = (match[2] || '').trim()
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
                else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
                process.env[key] = value
            }
        })
    }
} catch (e) {
    console.error('Error loading .env.local:', e)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function inspectDb() {
    console.log('--- DB INSPECTION ---')

    // Check Threats
    const { data: threats, error: tErr } = await supabase.from('Threat').select('id, threatId, type, severity, target, source')
    if (tErr) {
        console.error('Error fetching threats:', tErr)
    } else {
        console.log(`Threat count: ${threats?.length || 0}`)
        console.log('Threat details:', threats)
    }

    // Check Incidents
    const { data: incidents, error: iErr } = await supabase.from('Incident').select('id, incidentId, title, severity, status, created')
    if (iErr) {
        console.error('Error fetching incidents:', iErr)
    } else {
        console.log(`Incident count: ${incidents?.length || 0}`)
        console.log('Incident details (last 5):', incidents?.slice(0, 5))
    }

    // Check Playbooks
    const { data: playbooks, error: pErr } = await supabase.from('Playbook').select('id, playbookId, title, category, steps')
    if (pErr) {
        console.error('Error fetching playbooks:', pErr)
    } else {
        console.log(`Playbook count: ${playbooks?.length || 0}`)
        console.log('Playbook details (last 5):', playbooks?.slice(0, 5))
    }
}

inspectDb()
