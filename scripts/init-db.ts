import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

async function initDatabase() {
  try {
    console.log('Creating database tables...')

    // Create Threats table
    await sql`
      CREATE TABLE IF NOT EXISTS "Threat" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "threatId" TEXT NOT NULL UNIQUE,
        "type" TEXT NOT NULL,
        "severity" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "target" TEXT NOT NULL,
        "detected" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create index for Threat table
    await sql`CREATE INDEX IF NOT EXISTS "Threat_severity_idx" ON "Threat"("severity")`
    await sql`CREATE INDEX IF NOT EXISTS "Threat_status_idx" ON "Threat"("status")`
    await sql`CREATE INDEX IF NOT EXISTS "Threat_detected_idx" ON "Threat"("detected")`

    // Create RiskAnalysis table
    await sql`
      CREATE TABLE IF NOT EXISTS "RiskAnalysis" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "asset" TEXT NOT NULL UNIQUE,
        "riskLevel" INTEGER NOT NULL,
        "vulnerabilities" INTEGER NOT NULL,
        "exposureTime" TEXT NOT NULL,
        "recommendation" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS "RiskAnalysis_riskLevel_idx" ON "RiskAnalysis"("riskLevel")`

    // Create Incident table
    await sql`
      CREATE TABLE IF NOT EXISTS "Incident" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "incidentId" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "severity" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "assignee" TEXT NOT NULL,
        "created" TEXT NOT NULL,
        "updated" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS "Incident_severity_idx" ON "Incident"("severity")`
    await sql`CREATE INDEX IF NOT EXISTS "Incident_status_idx" ON "Incident"("status")`
    await sql`CREATE INDEX IF NOT EXISTS "Incident_created_idx" ON "Incident"("created")`

    // Create Playbook table
    await sql`
      CREATE TABLE IF NOT EXISTS "Playbook" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "playbookId" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "steps" INTEGER NOT NULL,
        "updatedBy" TEXT NOT NULL,
        "lastUpdated" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS "Playbook_category_idx" ON "Playbook"("category")`

    // Create Report table
    await sql`
      CREATE TABLE IF NOT EXISTS "Report" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "reportId" TEXT NOT NULL UNIQUE,
        "title" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "generated" TEXT NOT NULL,
        "threats" INTEGER NOT NULL,
        "resolved" INTEGER NOT NULL,
        "download" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS "Report_type_idx" ON "Report"("type")`
    await sql`CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status")`
    await sql`CREATE INDEX IF NOT EXISTS "Report_generated_idx" ON "Report"("generated")`

    // Create DashboardMetric table
    await sql`
      CREATE TABLE IF NOT EXISTS "DashboardMetric" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "threatsDetected" INTEGER NOT NULL DEFAULT 0,
        "threatsDetectedChange" INTEGER NOT NULL DEFAULT 0,
        "riskScore" INTEGER NOT NULL DEFAULT 0,
        "riskScoreChange" INTEGER NOT NULL DEFAULT 0,
        "incidentsActive" INTEGER NOT NULL DEFAULT 0,
        "incidentsActiveChange" INTEGER NOT NULL DEFAULT 0,
        "systemsMonitored" INTEGER NOT NULL DEFAULT 0,
        "systemsMonitoredChange" INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('✓ Database tables created successfully')
  } catch (error) {
    console.error('✗ Error initializing database:', error)
    process.exit(1)
  }
}

initDatabase()
