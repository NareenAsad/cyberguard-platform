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

async function testConnection() {
    try {
        const { data, error } = await supabase.from('Threat').select('id').limit(1)
        if (error) throw error
        console.log('✅ Supabase connected. Threat rows sample:', data?.length ?? 0)
    } catch (error) {
        console.error('❌ Connection failed:', error)
    }
}

testConnection()