import { createPlaybook } from '../src/lib/db'

async function main() {
    const result = await createPlaybook({
        title: 'Test Playbook',
        description: 'A test response playbook',
        category: 'RCE',
        steps: 7,
    })
    console.log('Result:', JSON.stringify(result, null, 2))
}

main().catch(console.error)
