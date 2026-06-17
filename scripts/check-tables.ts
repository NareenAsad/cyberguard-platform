import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
    const tables = ['Threat', 'RiskAnalysis', 'Incident', 'Playbook', 'Report', 'agent_jobs']
    for (const t of tables) {
        const { data, count, error } = await supabase
            .from(t)
            .select('*', { count: 'exact', head: true })
        
        if (error) {
            console.log(`❌ Table ${t} error:`, error.message)
        } else {
            console.log(`✅ Table ${t} has ${count} rows`)
        }
    }
}

main().catch(console.error)
