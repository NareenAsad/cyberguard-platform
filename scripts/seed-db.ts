import { neon } from '@neondatabase/serverless'
import 'dotenv/config'
import { threatData, riskAnalysis, incidents, playbooks, reports } from '@/lib/mock-data'

const sql = neon(process.env.DATABASE_URL!)

async function seedDatabase() {
  try {
    console.log('Seeding database with mock data...')

    // Seed Threats
    console.log('Seeding threats...')
    for (const threat of threatData) {
      await sql`
        INSERT INTO "Threat" (
          id, "threatId", type, severity, source, target, detected, status
        ) VALUES (
          ${Math.random().toString(36).substr(2, 9)},
          ${threat.id},
          ${threat.type},
          ${threat.severity},
          ${threat.source},
          ${threat.target},
          ${threat.detected},
          ${threat.status}
        )
        ON CONFLICT ("threatId") DO NOTHING
      `
    }

    // Seed Risk Analysis
    console.log('Seeding risk analysis...')
    for (const risk of riskAnalysis) {
      await sql`
        INSERT INTO "RiskAnalysis" (
          id, asset, "riskLevel", vulnerabilities, "exposureTime", recommendation
        ) VALUES (
          ${Math.random().toString(36).substr(2, 9)},
          ${risk.asset},
          ${risk.riskLevel},
          ${risk.vulnerabilities},
          ${risk.exposureTime},
          ${risk.recommendation}
        )
        ON CONFLICT (asset) DO NOTHING
      `
    }

    // Seed Incidents
    console.log('Seeding incidents...')
    for (const incident of incidents) {
      await sql`
        INSERT INTO "Incident" (
          id, "incidentId", title, description, severity, status, assignee, created, updated
        ) VALUES (
          ${Math.random().toString(36).substr(2, 9)},
          ${incident.id},
          ${incident.title},
          ${incident.description},
          ${incident.severity},
          ${incident.status},
          ${incident.assignee},
          ${incident.created},
          ${incident.updated}
        )
        ON CONFLICT ("incidentId") DO NOTHING
      `
    }

    // Seed Playbooks
    console.log('Seeding playbooks...')
    for (const playbook of playbooks) {
      await sql`
        INSERT INTO "Playbook" (
          id, "playbookId", title, description, category, steps, "updatedBy", "lastUpdated"
        ) VALUES (
          ${Math.random().toString(36).substr(2, 9)},
          ${playbook.id},
          ${playbook.title},
          ${playbook.description},
          ${playbook.category},
          ${playbook.steps},
          ${playbook.updatedBy},
          ${playbook.lastUpdated}
        )
        ON CONFLICT ("playbookId") DO NOTHING
      `
    }

    // Seed Reports
    console.log('Seeding reports...')
    for (const report of reports) {
      await sql`
        INSERT INTO "Report" (
          id, "reportId", title, type, status, generated, threats, resolved, download
        ) VALUES (
          ${Math.random().toString(36).substr(2, 9)},
          ${report.id},
          ${report.title},
          ${report.type},
          ${report.status},
          ${report.generated},
          ${report.threats},
          ${report.resolved},
          ${report.download || null}
        )
        ON CONFLICT ("reportId") DO NOTHING
      `
    }

    console.log('✓ Database seeded successfully with mock data')
  } catch (error) {
    console.error('✗ Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
