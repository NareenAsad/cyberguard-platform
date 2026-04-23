import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
    console.log('🌱 Seeding CyberGuard database...\n')

    // ── 1. Threats ────────────────────────────────────────────────────────────
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

    // ── 2. Risk Analysis ──────────────────────────────────────────────────────
    console.log('📊 Inserting risk analysis records...')
    await sql`
        INSERT INTO "RiskAnalysis" (id, "threatId", "assetId", "assetName", "riskLevel", "cvssScore", exploitability, "patchAvailable", "scoreBreakdown", "mitreAttack") VALUES

        ('risk-001', 'thr-001', 'asset-001', 'Production Web Server',
         95, 10.0, 'PUBLIC', TRUE,
         'CVSS 10.0 × 0.30 = 3.0 | Exploitability PUBLIC × 0.25 = 2.5 | Asset CRITICAL × 0.25 = 2.5 | Active Exploitation × 0.20 = 2.0 | Internet-facing ×1.15 = 95',
         'T1190'),

        ('risk-002', 'thr-002', 'asset-002', 'Auth API Gateway',
         72, 8.1, 'PUBLIC', FALSE,
         'CVSS 8.1 × 0.30 = 2.43 | Exploitability PUBLIC × 0.25 = 2.5 | Asset HIGH × 0.25 = 1.75 | Active Exploitation × 0.20 = 2.0 | Internet-facing ×1.15 = 72',
         'T1190'),

        ('risk-003', 'thr-003', 'asset-003', 'Spring Boot App Server',
         92, 9.8, 'PUBLIC', TRUE,
         'CVSS 9.8 × 0.30 = 2.94 | Exploitability PUBLIC × 0.25 = 2.5 | Asset CRITICAL × 0.25 = 2.5 | Active Campaign × 0.20 = 1.2 | Internet-facing ×1.15 = 92',
         'T1190'),

        ('risk-004', 'thr-004', 'asset-004', 'Bastion SSH Server',
         55, 5.0, 'THEORETICAL', TRUE,
         'CVSS 5.0 × 0.30 = 1.5 | No public exploit × 0.25 = 0.5 | Asset HIGH × 0.25 = 1.75 | Generic threat × 0.20 = 0.4 | Internet-facing ×1.15 = 55',
         'T1078'),

        ('risk-005', 'thr-005', 'asset-005', 'Developer Workstation',
         88, 9.0, 'PUBLIC', FALSE,
         'CVSS 9.0 × 0.30 = 2.7 | C2 confirmed PUBLIC × 0.25 = 2.5 | Asset HIGH × 0.25 = 1.75 | Active Exploitation × 0.20 = 2.0 | Internal ×1.0 = 88',
         'T1071'),

        ('risk-006', 'thr-006', 'asset-001', 'Production Web Server',
         68, 7.5, 'POC_ONLY', TRUE,
         'CVSS 7.5 × 0.30 = 2.25 | PoC exploit × 0.25 = 1.5 | Asset CRITICAL × 0.25 = 2.5 | Generic threat × 0.20 = 0.4 | Internet-facing ×1.15 = 68',
         'T1190'),

        ('risk-007', 'thr-008', 'asset-005', 'Developer Workstation',
         85, 8.8, 'PUBLIC', FALSE,
         'CVSS 8.8 × 0.30 = 2.64 | Public tool × 0.25 = 2.5 | Asset HIGH × 0.25 = 1.75 | Active Exploitation × 0.20 = 2.0 | Internal ×1.0 = 85',
         'T1003'),

        ('risk-008', 'thr-009', 'asset-001', 'Production Web Server',
         78, 9.8, 'PUBLIC', TRUE,
         'CVSS 9.8 × 0.30 = 2.94 | Public exploit × 0.25 = 2.5 | Asset CRITICAL × 0.25 = 2.5 | Generic threat × 0.20 = 0.4 | Internet-facing ×1.15 = 78',
         'T1190'),

        ('risk-009', 'thr-010', 'asset-006', 'File Server',
         98, 10.0, 'PUBLIC', FALSE,
         'CVSS 10.0 × 0.30 = 3.0 | Ransomware PUBLIC × 0.25 = 2.5 | Asset CRITICAL × 0.25 = 2.5 | Active Exploitation × 0.20 = 2.0 | Internal ×1.0 = 98 (EMERGENCY)',
         'T1486'),

        ('risk-010', 'thr-012', 'asset-007', 'Internal DNS Server',
         62, 7.0, 'POC_ONLY', TRUE,
         'CVSS 7.0 × 0.30 = 2.1 | PoC only × 0.25 = 1.5 | Asset HIGH × 0.25 = 1.75 | Targeted campaign × 0.20 = 1.2 | Internal ×1.0 = 62',
         'T1071')

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 10 risk analysis records inserted')

    // ── 3. Incidents ──────────────────────────────────────────────────────────
    console.log('🚨 Inserting incidents...')
    await sql`
        INSERT INTO "Incident" (id, "incidentId", title, description, severity, status, assignee, "threatId") VALUES

        ('inc-001', 'INC-2024-001',
         'Log4Shell Active Exploitation on Production Server',
         'CVE-2021-44228 actively exploited against web-prod-01. Attacker attempted to establish reverse shell via JNDI callback.',
         'critical', 'in-progress', 'Sarah Chen', 'thr-001'),

        ('inc-002', 'INC-2024-002',
         'Suspected Ransomware Activity on File Server',
         'Mass file encryption pattern consistent with LockBit 3.0 detected. 2,400 files encrypted in 8 minutes.',
         'critical', 'open', 'Ahmed Malik', 'thr-010'),

        ('inc-003', 'INC-2024-003',
         'Cobalt Strike C2 Beacon from Developer Machine',
         'dev-ws-04 beaconing to known Cobalt Strike server every 60 seconds. Possible initial access via phishing.',
         'critical', 'in-progress', 'James Wilson', 'thr-005'),

        ('inc-004', 'INC-2024-004',
         'SQL Injection Campaign Against Auth API',
         'Automated SQL injection tool detected targeting login endpoint. 847 requests in 10 minutes from Tor exit node.',
         'high', 'in-progress', 'Maria Santos', 'thr-002'),

        ('inc-005', 'INC-2024-005',
         'Spring4Shell Exploitation Attempt',
         'Multiple exploitation attempts for CVE-2022-22965 blocked by WAF. Patch deployment required immediately.',
         'high', 'open', 'Sarah Chen', 'thr-003'),

        ('inc-006', 'INC-2024-006',
         'Employee Phishing Link Clicked',
         'User john.doe@company.com clicked MS365 phishing link. Credentials may be compromised. MFA review required.',
         'high', 'resolved', 'James Wilson', 'thr-007'),

        ('inc-007', 'INC-2024-007',
         'SSH Brute Force on Bastion Host',
         'Bastion host under brute force attack. IP blocked at firewall. No successful authentication confirmed.',
         'medium', 'resolved', 'Ahmed Malik', 'thr-004'),

        ('inc-008', 'INC-2024-008',
         'ProxyLogon Exploitation Attempt',
         'Exchange server targeted with CVE-2021-26855. Attack blocked. Emergency patch applied.',
         'critical', 'resolved', 'Maria Santos', 'thr-014')

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 8 incidents inserted')

    // ── 4. Playbooks ──────────────────────────────────────────────────────────
    console.log('📋 Inserting playbooks...')
    await sql`
        INSERT INTO "Playbook" (id, title, description, category, content, "incidentId", "cveId") VALUES

        ('pb-001', 'Log4Shell (CVE-2021-44228) Response Playbook',
         'Complete incident response guide for Log4Shell remote code execution exploitation.',
         'RCE',
         ${JSON.stringify({
        preparation: [
            { step: 1, action: 'Identify all Java applications using Log4j 2.0-2.14.1', reasoning: 'Log4Shell affects these specific versions; you must scope the exposure first.' },
            { step: 2, action: 'Ensure network monitoring tools are capturing outbound JNDI/LDAP traffic', reasoning: 'Exploitation generates distinctive outbound LDAP/RMI connections that confirm active exploitation.' }
        ],
        identification: [
            { step: 1, action: 'Search logs for patterns: ${jndi:, ${${::-j}${::-n}${::-d}${::-i}', reasoning: 'These are the core JNDI injection patterns used in Log4Shell attacks.' },
            { step: 2, action: 'Run: grep -r "jndi:" /var/log/apache* /var/log/nginx*', reasoning: 'Web server logs capture the malicious User-Agent or URL parameters.' }
        ],
        containment: [
            { step: 1, action: 'Set LOG4J_FORMAT_MSG_NO_LOOKUPS=true environment variable immediately', reasoning: 'This disables JNDI lookups without requiring a code change or restart.' },
            { step: 2, action: 'Block outbound LDAP (389) and RMI (1099) at firewall', reasoning: 'Prevents the callback that delivers the malicious payload.' }
        ],
        eradication: [
            { step: 1, action: 'Update Log4j to version 2.17.1 or later', reasoning: '2.17.1 is the fully patched version addressing all Log4Shell variants.' },
            { step: 2, action: 'Rebuild affected containers/images with patched base images', reasoning: 'Ensures no vulnerable version persists in the deployment pipeline.' }
        ],
        recovery: [
            { step: 1, action: 'Deploy patched application version to production', reasoning: 'Normal service restoration after patch validation in staging.' },
            { step: 2, action: 'Monitor for residual C2 traffic for 72 hours post-patch', reasoning: 'Attackers may have established persistence before the patch.' }
        ],
        lessonsLearned: [
            { step: 1, action: 'Add Log4j version scanning to CI/CD pipeline (OWASP Dependency Check)', reasoning: 'Prevents reintroduction of vulnerable versions in future deployments.' }
        ]
    })},
         'inc-001', 'CVE-2021-44228'),

        ('pb-002', 'Ransomware Response Playbook',
         'Emergency response procedures for active ransomware encryption events.',
         'Ransomware',
         ${JSON.stringify({
        preparation: [
            { step: 1, action: 'Confirm offline backup availability and integrity', reasoning: 'Recovery depends entirely on having clean backups untouched by the ransomware.' }
        ],
        containment: [
            { step: 1, action: 'IMMEDIATELY isolate affected systems from network (unplug or VLAN quarantine)', reasoning: 'Every second connected allows the ransomware to encrypt more files and spread laterally.' },
            { step: 2, action: 'Disable all shared drives and network shares', reasoning: 'Ransomware traverses mapped drives — disconnecting shares stops lateral spread.' }
        ],
        identification: [
            { step: 1, action: 'Identify ransomware family via ransom note or encrypted file extension', reasoning: 'Family identification reveals if a free decryptor exists (check nomoreransom.org).' }
        ],
        eradication: [
            { step: 1, action: 'Wipe and reimage all affected systems from known-clean images', reasoning: 'Ransomware may install backdoors — reimaging is safer than attempting cleanup.' }
        ],
        recovery: [
            { step: 1, action: 'Restore from last known-clean backup to isolated network', reasoning: 'Validate data integrity in isolation before reconnecting to production network.' }
        ],
        lessonsLearned: [
            { step: 1, action: 'Implement 3-2-1 backup rule: 3 copies, 2 media types, 1 offsite', reasoning: 'Ransomware-resilient backup strategy prevents total data loss.' }
        ]
    })},
         'inc-002', NULL),

        ('pb-003', 'SQL Injection Response Playbook',
         'Response procedures for SQL injection attacks against web applications.',
         'Web Attack',
         ${JSON.stringify({
        containment: [
            { step: 1, action: 'Block attacking IP at WAF/firewall immediately', reasoning: 'Stops ongoing attack while investigation proceeds.' },
            { step: 2, action: 'Enable WAF SQLi blocking rules if in detection-only mode', reasoning: 'SQLi detection mode logs but does not block — switch to prevention mode.' }
        ],
        identification: [
            { step: 1, action: "Review DB logs for UNION, SELECT, DROP, ' OR 1=1 patterns", reasoning: 'These are canonical SQLi payloads that confirm successful injection attempts.' }
        ],
        eradication: [
            { step: 1, action: 'Audit all database queries for parameterization', reasoning: 'Parameterized queries are the only reliable SQLi prevention mechanism.' }
        ],
        recovery: [
            { step: 1, action: 'Verify no data was exfiltrated by reviewing DB audit logs', reasoning: 'Confirm breach scope before declaring incident resolved.' }
        ],
        lessonsLearned: []
    })},
         'inc-004', NULL)

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 3 playbooks inserted')

    // ── 5. Reports ────────────────────────────────────────────────────────────
    console.log('📄 Inserting reports...')
    await sql`
        INSERT INTO "Report" (id, title, type, status, content) VALUES

        ('rep-001', 'Weekly Executive Security Summary - Week 16',
         'executive', 'final',
         ${JSON.stringify({
        summary: 'This week CyberGuard detected 15 threats with 5 classified as CRITICAL. Two active incidents require immediate executive attention: a potential ransomware event on the file server and active Log4Shell exploitation.',
        keyRisks: [
            { risk: 'Ransomware on File Server', businessImpact: 'Potential loss of all unencrypted file shares. Estimated recovery time: 48-72 hours.', priority: 1 },
            { risk: 'Log4Shell on Web Server', businessImpact: 'Remote code execution could expose customer data. GDPR breach notification may be required.', priority: 2 }
        ],
        postureScore: 42,
        trend: 'Deteriorating — up from 3 critical findings last week to 5 this week.'
    })}),

        ('rep-002', 'Technical Threat Intelligence Report - April 2026',
         'technical', 'final',
         ${JSON.stringify({
        totalThreats: 15,
        criticalThreats: 5,
        topCVEs: ['CVE-2021-44228', 'CVE-2022-22965', 'CVE-2021-41773'],
        topAttackTechniques: ['T1190 - Exploit Public-Facing App', 'T1486 - Ransomware', 'T1071 - C2 Beaconing'],
        recommendations: [
            'Immediately patch Log4j on all Java applications',
            'Isolate file server and begin ransomware recovery procedure',
            'Deploy endpoint detection on all developer workstations'
        ]
    })}),

        ('rep-003', 'Compliance Security Report - ISO 27001',
         'compliance', 'draft',
         ${JSON.stringify({
        framework: 'ISO 27001:2022',
        controlsAssessed: 12,
        controlsPassing: 8,
        controlsFailing: 4,
        failingControls: [
            { control: 'A.12.6.1', name: 'Management of technical vulnerabilities', finding: 'Log4j not patched within SLA' },
            { control: 'A.16.1.5', name: 'Response to information security incidents', finding: 'Ransomware response SLA breached' }
        ]
    })})

        ON CONFLICT (id) DO NOTHING
    `
    console.log('   ✅ 3 reports inserted')

    // ── 6. Verify counts ──────────────────────────────────────────────────────
    console.log('\n📈 Verifying seed data...')
    const counts = await sql`
        SELECT
            (SELECT COUNT(*) FROM "Threat")       AS threats,
            (SELECT COUNT(*) FROM "RiskAnalysis") AS risks,
            (SELECT COUNT(*) FROM "Incident")     AS incidents,
            (SELECT COUNT(*) FROM "Playbook")     AS playbooks,
            (SELECT COUNT(*) FROM "Report")       AS reports
    `
    console.log('\n   Database row counts:')
    console.table(counts[0])
    console.log('\n✅ Seed complete! Your dashboard should now show live data.\n')
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})
