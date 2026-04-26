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

async function main() {
    const { data, error } = await supabase
        .from('Playbook')
        .select('id,title,category,lastUpdated')
        .order('lastUpdated', { ascending: false })
        .limit(5)

    if (error) {
        throw error
    }

    console.log('Recent Playbook rows:', JSON.stringify(data, null, 2))
}

main().catch(console.error)
