import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { getThreats } from '../src/lib/db'

async function main() {
    const res = await getThreats()
    console.log('Result success:', res.success)
    if (res.success) {
        console.log('Total threats returned by getThreats():', res.data?.length)
        console.log('First 5 threats details:')
        console.log(JSON.stringify(res.data?.slice(0, 5), null, 2))
    } else {
        console.error('Error:', res.error)
    }
}

main().catch(console.error)
