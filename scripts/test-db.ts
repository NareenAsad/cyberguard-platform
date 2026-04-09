import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

console.log('DB URL:', process.env.DATABASE_URL) // 👈 ADD THIS

const sql = neon(process.env.DATABASE_URL!)

async function testConnection() {
    try {
        const result = await sql`SELECT NOW()`
        console.log('✅ Database connected:', result)
    } catch (error) {
        console.error('❌ Connection failed:', error)
    }
}

testConnection()