import 'dotenv/config'
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

async function initDatabase() {
  try {
    console.log('Validating required Supabase tables...')
    const requiredTables = ['Threat', 'RiskAnalysis', 'Incident', 'Playbook', 'Report', 'agent_jobs']
    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.error(`✗ Missing table or access issue: ${table}`, error.message)
        process.exit(1)
      }
      console.log(`✓ ${table}`)
    }
    console.log('✓ Supabase schema looks ready')
  } catch (error) {
    console.error('✗ Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()
