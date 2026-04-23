/**
 * CyberGuard - Database Seed Script
 * Run: npx tsx scripts/seed.ts
 */

import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') })

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local')
    process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function seed() {
    console.log('🌱 Seeding CyberGuard database...\n')

    console.log('📌 Inserting threats...')
    await sql`
        INSERT INTO "Threat" (id, title, description, severity, status, source, "cveId", "ipAddress", detected) VALUES

        ('thr-001', 'Log4Shell Remote Code Execution',
         'Critical RCE vulnerability in Apache Log4j 2 allows unauthenticated remote code execution via JNDI lookup.',
         'critical', 'active', 'NVD', 'CVE-2021-44228', '45.33.32.156',
         NOW() - INTERVAL '2 hours'),

        ('thr-002', 'SQL Injection Attempt on Login Endpoint',
         'Repeated SQL injection payloads detected targeting /api/auth/login from a Tor exit node.',
         'high', 'investigating', 'AbuseIPDB', NULL, '185.220.101.47',
         NOW() - INTERVAL '5 hours'),

        ('thr-003', 'Spring4Shell Exploit Attempt',
         'Active exploitation of CVE-2022-22965 detected against production Spring Boot application.',
         'critical', 'active', 'OTX', 'CVE-2022-22965', '91.92.251.103',
         NOW() - INTERVAL '30 minutes'),

        ('thr-004', 'Brute Force SSH Attack',
         'Over 2,400 failed SSH login attempts from single IP in 15-minute window.',
         'medium', 'active', 'AbuseIPDB', NULL, '103.22.200.177',
         NOW() - INTERVAL '1 hour'),

        ('thr-005', 'Malicious Domain C2 Beacon',
         'Internal host communicating with known Cobalt Strike C2 infrastructure at high frequency.',
         'critical', 'investigating', 'ThreatFox', NULL, '194.165.16.75',
         NOW() - INTERVAL '15 minutes'),

        ('thr-006', 'OpenSSL Buffer Overflow',
         'Vulnerable OpenSSL version 1.0.2 detected on multiple production servers.',
         'high', 'active', 'NVD', 'CVE-2022-0778', NULL,
         NOW() - INTERVAL '12 hours'),

        ('thr-007', 'Phishing URL Detected',
         'Employee clicked on phishing URL mimicking Microsoft 365 login page.',
         'high', 'resolved', 'URLhaus', NULL, '162.243.167.84',
         NOW() - INTERVAL '1 day'),

        ('thr-008', 'Suspicious PowerShell Execution',
         'Encoded PowerShell command detected attempting LSASS memory dump.',
         'critical', 'active', 'OTX', NULL, NULL,
         NOW() - INTERVAL '45 minutes'),

        ('thr-009', 'Outdated Apache HTTP Server',
         'Apache 2.4.49 vulnerable to path traversal and RCE is running on web-prod-01.',
         'high', 'active', 'NVD', 'CVE-2021-41773', NULL,
         NOW() - INTERVAL '6 hours'),

        ('thr-010', 'Ransomware Indicator - File Encryption Pattern',
         'Mass file modification events detected matching LockBit 3.0 encryption pattern.',
         'critical', 'investigating', 'ThreatFox', NULL, NULL,
         NOW() - INTERVAL '10 minutes'),

        ('thr-011', 'Exposed Admin Panel',
         'WordPress admin panel exposed to internet without MFA protection.',
         'medium', 'active', 'OTX', NULL, '10.0.1.15',
         NOW() - INTERVAL '2 days'),

        ('thr-012', 'DNS Tunneling Activity',
         'Abnormally high DNS query volume suggesting data exfiltration via DNS tunneling.',
         'high', 'active', 'OTX', NULL, '10.0.1.22',
         NOW() - INTERVAL '3 hours'),

        ('thr-013', 'Expired SSL Certificate',
         'SSL certificate for api.internal.company.com expired 5 days ago.',
         'low', 'active', 'NVD', NULL, NULL,
         NOW() - INTERVAL '5 days'),

        ('thr-014', 'ProxyLogon Exchange Exploit',
         'Attempted exploitation of Microsoft Exchange Server SSRF vulnerability.',
         'critical', 'resolved', 'NVD', 'CVE-2021-26855', '5.188.206.26',
         NOW() - INTERVAL '3 days'),

        ('thr-015', 'Default Credentials on IoT Device',
         'Network scanner detected IoT device using factory default admin:admin credentials.',
         'medium', 'active', 'OTX', NULL, '192.168.1.105',
         NOW() - INTERVAL '1 day')

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 15 threats inserted')

    console.log('📊 Inserting risk analysis records...')
    await sql`
        INSERT INTO "RiskAnalysis" (id, "threatId", "assetId", "assetName", "riskLevel", "cvssScore", exploitability, "patchAvailable", "scoreBreakdown", "mitreAttack") VALUES

        ('risk-001', 'thr-001', 'asset-001', 'Production Web Server',    95, 10.0, 'PUBLIC',      true,  'CVSS 10.0 | Exploit PUBLIC | Asset CRITICAL | Active exploitation | Internet-facing', 'T1190'),
        ('risk-002', 'thr-002', 'asset-002', 'Auth API Gateway',         72, 8.1,  'PUBLIC',      false, 'CVSS 8.1 | Exploit PUBLIC | Asset HIGH | Active exploitation | Internet-facing',    'T1190'),
        ('risk-003', 'thr-003', 'asset-003', 'Spring Boot App Server',   92, 9.8,  'PUBLIC',      true,  'CVSS 9.8 | Exploit PUBLIC | Asset CRITICAL | Targeted campaign | Internet-facing',  'T1190'),
        ('risk-004', 'thr-004', 'asset-004', 'Bastion SSH Server',       55, 5.0,  'THEORETICAL', true,  'CVSS 5.0 | No public exploit | Asset HIGH | Generic threat | Internet-facing',       'T1078'),
        ('risk-005', 'thr-005', 'asset-005', 'Developer Workstation',    88, 9.0,  'PUBLIC',      false, 'CVSS 9.0 | C2 confirmed | Asset HIGH | Active exploitation | Internal',             'T1071'),
        ('risk-006', 'thr-006', 'asset-001', 'Production Web Server',    68, 7.5,  'POC_ONLY',    true,  'CVSS 7.5 | PoC exploit | Asset CRITICAL | Generic threat | Internet-facing',        'T1190'),
        ('risk-007', 'thr-008', 'asset-005', 'Developer Workstation',    85, 8.8,  'PUBLIC',      false, 'CVSS 8.8 | Public tool | Asset HIGH | Active exploitation | Internal',              'T1003'),
        ('risk-008', 'thr-009', 'asset-001', 'Production Web Server',    78, 9.8,  'PUBLIC',      true,  'CVSS 9.8 | Public exploit | Asset CRITICAL | Generic threat | Internet-facing',     'T1190'),
        ('risk-009', 'thr-010', 'asset-006', 'File Server',              98, 10.0, 'PUBLIC',      false, 'CVSS 10.0 | Ransomware | Asset CRITICAL | Active exploitation | Internal',          'T1486'),
        ('risk-010', 'thr-012', 'asset-007', 'Internal DNS Server',      62, 7.0,  'POC_ONLY',    true,  'CVSS 7.0 | PoC only | Asset HIGH | Targeted campaign | Internal',                  'T1071')

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 10 risk records inserted')

    console.log('🚨 Inserting incidents...')
    await sql`
        INSERT INTO "Incident" (id, "incidentId", title, description, severity, status, assignee, "threatId") VALUES

        ('inc-001', 'INC-2024-001', 'Log4Shell Active Exploitation on Production Server',
         'CVE-2021-44228 actively exploited against web-prod-01. Attacker attempted reverse shell via JNDI callback.',
         'critical', 'in-progress', 'Sarah Chen', 'thr-001'),

        ('inc-002', 'INC-2024-002', 'Suspected Ransomware Activity on File Server',
         'Mass file encryption pattern consistent with LockBit 3.0. 2,400 files encrypted in 8 minutes.',
         'critical', 'open', 'Ahmed Malik', 'thr-010'),

        ('inc-003', 'INC-2024-003', 'Cobalt Strike C2 Beacon from Developer Machine',
         'dev-ws-04 beaconing to known C2 server every 60 seconds. Possible initial access via phishing.',
         'critical', 'in-progress', 'James Wilson', 'thr-005'),

        ('inc-004', 'INC-2024-004', 'SQL Injection Campaign Against Auth API',
         'Automated SQLi tool detected targeting login endpoint. 847 requests in 10 minutes from Tor exit node.',
         'high', 'in-progress', 'Maria Santos', 'thr-002'),

        ('inc-005', 'INC-2024-005', 'Spring4Shell Exploitation Attempt',
         'Multiple exploitation attempts for CVE-2022-22965 blocked by WAF. Patch required immediately.',
         'high', 'open', 'Sarah Chen', 'thr-003'),

        ('inc-006', 'INC-2024-006', 'Employee Phishing Link Clicked',
         'User clicked MS365 phishing link. Credentials may be compromised. MFA review required.',
         'high', 'resolved', 'James Wilson', 'thr-007'),

        ('inc-007', 'INC-2024-007', 'SSH Brute Force on Bastion Host',
         'Bastion host under brute force attack. IP blocked at firewall. No successful auth confirmed.',
         'medium', 'resolved', 'Ahmed Malik', 'thr-004'),

        ('inc-008', 'INC-2024-008', 'ProxyLogon Exploitation Attempt',
         'Exchange server targeted with CVE-2021-26855. Attack blocked. Emergency patch applied.',
         'critical', 'resolved', 'Maria Santos', 'thr-014')

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 8 incidents inserted')

    console.log('📋 Inserting playbooks...')
    await sql`
        INSERT INTO "Playbook" (id, title, description, category, "incidentId", "cveId") VALUES
        ('pb-001', 'Log4Shell Response Playbook',    'Complete IR guide for Log4Shell RCE exploitation.',  'RCE',        'inc-001', 'CVE-2021-44228'),
        ('pb-002', 'Ransomware Response Playbook',   'Emergency response for active ransomware events.',   'Ransomware', 'inc-002', NULL),
        ('pb-003', 'SQL Injection Response Playbook','Response procedures for SQLi attacks.',              'Web Attack', 'inc-004', NULL)
        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 3 playbooks inserted')

    console.log('📄 Inserting reports...')
    await sql`
        INSERT INTO "Report" (id, title, type, status) VALUES
        ('rep-001', 'Weekly Executive Security Summary - Week 16', 'executive',  'final'),
        ('rep-002', 'Technical Threat Intelligence Report - April 2026',         'technical',  'final'),
        ('rep-003', 'Compliance Security Report - ISO 27001',                    'compliance', 'draft')
        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 3 reports inserted')

    // Verify
    const counts = await sql`
        SELECT
            (SELECT COUNT(*) FROM "Threat")       AS threats,
            (SELECT COUNT(*) FROM "RiskAnalysis") AS risks,
            (SELECT COUNT(*) FROM "Incident")     AS incidents,
            (SELECT COUNT(*) FROM "Playbook")     AS playbooks,
            (SELECT COUNT(*) FROM "Report")       AS reports
    `
    console.log('\n📈 Final counts:')
    console.table(counts[0])
    console.log('\n✅ Seed complete! Refresh your dashboard.\n')
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})