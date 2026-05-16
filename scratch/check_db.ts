import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function check() {
    console.log("Checking Playbook...")
    let { data: pb, error: pbErr } = await supabase.from('Playbook').select('*').limit(1)
    console.log(pbErr || (pb && pb.length > 0 ? Object.keys(pb[0]) : 'Empty table'))

    console.log("Checking Report...")
    let { data: rep, error: repErr } = await supabase.from('Report').select('*').limit(1)
    console.log(repErr || (rep && rep.length > 0 ? Object.keys(rep[0]) : 'Empty table'))

    // Also check if we can insert 'content'
}

check()
