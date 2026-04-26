import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { threatData, riskAnalysis, incidents, playbooks, reports } from '@/lib/mock-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function seedDatabase() {
  try {
    console.log('Seeding database with mock data...')

    // Seed Threats
    console.log('Seeding threats...')
    for (const threat of threatData) {
      await supabase.from('Threat').upsert({
        id: Math.random().toString(36).substr(2, 9),
        threatId: threat.id,
        type: threat.type,
        severity: threat.severity,
        source: threat.source,
        target: threat.target,
        detected: threat.detected,
        status: threat.status,
      }, { onConflict: 'threatId', ignoreDuplicates: true })
    }

    // Seed Risk Analysis
    console.log('Seeding risk analysis...')
    for (const risk of riskAnalysis) {
      await supabase.from('RiskAnalysis').upsert({
        id: Math.random().toString(36).substr(2, 9),
        asset: risk.asset,
        riskLevel: risk.riskLevel,
        vulnerabilities: risk.vulnerabilities,
        exposureTime: risk.exposureTime,
        recommendation: risk.recommendation,
      }, { onConflict: 'asset', ignoreDuplicates: true })
    }

    // Seed Incidents
    console.log('Seeding incidents...')
    for (const incident of incidents) {
      await supabase.from('Incident').upsert({
        id: Math.random().toString(36).substr(2, 9),
        incidentId: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        assignee: incident.assignee,
        created: incident.created,
        updated: incident.updated,
      }, { onConflict: 'incidentId', ignoreDuplicates: true })
    }

    // Seed Playbooks
    console.log('Seeding playbooks...')
    for (const playbook of playbooks) {
      await supabase.from('Playbook').upsert({
        id: Math.random().toString(36).substr(2, 9),
        playbookId: playbook.id,
        title: playbook.title,
        description: playbook.description,
        category: playbook.category,
        steps: playbook.steps,
        updatedBy: playbook.updatedBy,
        lastUpdated: playbook.lastUpdated,
      }, { onConflict: 'playbookId', ignoreDuplicates: true })
    }

    // Seed Reports
    console.log('Seeding reports...')
    for (const report of reports) {
      await supabase.from('Report').upsert({
        id: Math.random().toString(36).substr(2, 9),
        reportId: report.id,
        title: report.title,
        type: report.type,
        status: report.status,
        generated: report.generated,
        threats: report.threats,
        resolved: report.resolved,
        download: report.download || null,
      }, { onConflict: 'reportId', ignoreDuplicates: true })
    }

    console.log('✓ Database seeded successfully with mock data')
  } catch (error) {
    console.error('✗ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
