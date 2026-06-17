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
    const { data, error } = await supabase
        .from('Threat')
        .select('*')
        .order('detected', { ascending: false })

    if (error) {
        throw error
    }

    console.log('Total threats in DB:', data?.length)
    console.log('Threat rows:', JSON.stringify(data, null, 2))
}

main().catch(console.error)
