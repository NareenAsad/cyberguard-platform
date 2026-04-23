import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function main() {
    const cols = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Playbook'
        ORDER BY ordinal_position
    `
    console.log('Playbook columns:', JSON.stringify(cols, null, 2))

    const constraints = await sql`
        SELECT pg_get_constraintdef(c.oid) AS definition
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'Playbook' AND c.contype = 'c'
    `
    console.log('Playbook check constraints:', JSON.stringify(constraints, null, 2))
}

main().catch(console.error)
