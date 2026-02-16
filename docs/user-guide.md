# User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Asset Management](#asset-management)
4. [Alert Investigation](#alert-investigation)
5. [Incident Response](#incident-response)
6. [Reporting](#reporting)
7. [System Configuration](#system-configuration)
8. [User Roles & Permissions](#user-roles--permissions)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Account Setup

1. **Registration**
   - Navigate to the CyberGuard login page
   - Click "Sign Up" or contact your administrator for an invitation
   - Fill in your details (email, name, password)
   - Verify your email address

2. **First Login**
   - Enter your credentials
   - You'll be directed to the dashboard
   - Complete the onboarding wizard (first-time users)

3. **Profile Setup**
   - Click your profile icon (top right)
   - Add profile picture (optional)
   - Set notification preferences
   - Enable two-factor authentication (recommended)

### System Requirements

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Screen Resolution**: Minimum 1366x768 (1920x1080 recommended)

---

## Dashboard Overview

The dashboard is your central hub for monitoring your organization's security posture.

### Main Components

#### 1. **Threat Map**
- **Location**: Top left of dashboard
- **Purpose**: Visualizes geographic origin of threats
- **Interactions**:
  - Hover over markers to see threat details
  - Click markers to view related alerts
  - Use zoom controls for better visibility

#### 2. **Alert Feed**
- **Location**: Center panel
- **Features**:
  - Real-time alert stream
  - Color-coded severity (Red=Critical, Orange=High, Yellow=Medium, Green=Low)
  - Quick actions (View, Assign, Mark as False Positive)
- **Filters**:
  - Severity level
  - Date range
  - Status (Open, Investigating, Resolved)
  - Assigned user

#### 3. **Risk Metrics**
- **Location**: Top right cards
- **Metrics Displayed**:
  - Total Active Alerts
  - Average Risk Score
  - Critical Vulnerabilities
  - Mean Time to Detect (MTTD)
  - Mean Time to Respond (MTTR)

#### 4. **Trend Charts**
- **Location**: Bottom section
- **Charts Available**:
  - Alert volume over time
  - Risk score trends
  - Top affected assets
  - Threat type distribution

### Navigation Menu

**Left Sidebar**:
- 🏠 **Dashboard**: Overview and metrics
- 🚨 **Alerts**: Detailed alert management
- 🖥️ **Assets**: Asset inventory and management
- 📊 **Reports**: Generate and view reports
- ⚙️ **Settings**: System configuration
- 👤 **Profile**: User account settings

---

## Asset Management

Effective threat detection requires an up-to-date asset inventory.

### Viewing Assets

1. Navigate to **Assets** from the sidebar
2. View your asset list with the following information:
   - Asset name and type
   - IP address / Hostname
   - Operating system
   - Installed software
   - Criticality level
   - Number of vulnerabilities
   - Last updated timestamp

### Adding Assets

#### Manual Entry

1. Click **"Add Asset"** button
2. Fill in the required fields:
   - **Name**: Descriptive name (e.g., "Web Server 01")
   - **Type**: Select from dropdown (Server, Workstation, Network Device, etc.)
   - **IP Address**: IPv4 or IPv6 address
   - **Hostname**: Fully qualified domain name
   - **Operating System**: OS name and version
   - **Software**: Click "Add Software" to list installed applications
     - Software name
     - Version
     - CPE string (optional, auto-detected when possible)
   - **Criticality**: Low, Medium, High, or Critical
   - **Owner**: Team or individual responsible
   - **Description**: Additional context
3. Click **"Save Asset"**

#### Bulk Import (CSV)

1. Click **"Import Assets"**
2. Download the CSV template
3. Fill in your asset data:
   ```csv
   name,type,ip_address,hostname,os,criticality,owner
   Web Server 01,server,192.168.1.10,web-01.company.com,Ubuntu 22.04,high,IT Team
   DB Server 01,database,192.168.1.20,db-01.company.com,CentOS 8,critical,DB Team
   ```
4. Upload your completed CSV
5. Review the import summary
6. Confirm to save

### Editing Assets

1. Click on any asset in the list
2. Click the **"Edit"** button
3. Modify fields as needed
4. Click **"Save Changes"**

### Deleting Assets

1. Click on the asset you want to remove
2. Click **"Delete Asset"**
3. Confirm deletion
   - **Note**: This will remove associated vulnerability mappings

### Asset Details View

Click any asset to see:
- **Overview**: Basic information and criticality
- **Software Inventory**: Detailed list of installed software
- **Vulnerabilities**: CVEs affecting this asset
  - CVE ID
  - CVSS score and severity
  - Description
  - Patch availability
- **Recent Alerts**: Related security alerts
- **History**: Change log and audit trail

---

## Alert Investigation

When CyberGuard detects a threat, it generates an alert for investigation.

### Understanding Alerts

Each alert contains:
- **Title**: Brief description of the threat
- **Severity**: Critical, High, Medium, or Low
- **Risk Score**: 0-100 (higher = more urgent)
- **Threat Type**: Vulnerability, Malware, Phishing, etc.
- **Affected Assets**: Systems impacted
- **Indicators**: IPs, domains, file hashes, CVE IDs
- **MITRE ATT&CK**: Tactic and technique classification
- **Status**: Open, Investigating, Resolved, False Positive

### Alert Workflow

#### Step 1: Review Alert Details

1. Navigate to **Alerts** section
2. Click on an alert to open details
3. Read the description and threat intelligence
4. Review affected assets
5. Check MITRE ATT&CK mapping to understand attacker behavior

#### Step 2: Assign Alert

1. Click **"Assign"** button
2. Select a team member from the dropdown
3. (Optional) Add a note explaining why you're assigning
4. The assigned person receives a notification

#### Step 3: Change Status

1. Click **"Change Status"** dropdown
2. Select appropriate status:
   - **Open**: Not yet being worked on
   - **Investigating**: Active investigation
   - **Resolved**: Threat mitigated
   - **False Positive**: Not a real threat
3. Add a note documenting your action

#### Step 4: Add Investigation Notes

1. Scroll to the **Notes** section
2. Click **"Add Note"**
3. Document:
   - Findings from logs
   - Actions taken
   - Decisions made
   - Evidence collected
4. Notes are timestamped and attributed to you

### Alert Filters

Use filters to find relevant alerts:
- **Severity**: Show only Critical/High alerts
- **Status**: View only Open alerts
- **Date Range**: Last 24 hours, Last week, Custom range
- **Assigned To**: Your alerts or unassigned
- **Asset**: Alerts affecting specific systems

### Alert Actions

**Quick Actions** (available from alert list):
- 👁️ **View**: Open full alert details
- ✅ **Mark as False Positive**: Dismiss non-threats
- 🔄 **Refresh**: Update with latest data

**Detailed Actions** (within alert details):
- 📋 **Generate Playbook**: Create incident response steps
- 📧 **Notify Team**: Send email to stakeholders
- 🔗 **Link to Ticket**: Connect to external ticketing system
- 📥 **Export**: Download alert as PDF/JSON

---

## Incident Response

CyberGuard's AI generates customized incident response playbooks.

### Generating a Playbook

1. Open an alert
2. Click **"Generate Response Playbook"**
3. (Optional) Specify organizational context:
   - Available response capabilities
   - Business constraints (e.g., "maintain 24/7 availability")
4. Wait 10-30 seconds for AI generation
5. Review the generated playbook

### Playbook Structure

A typical playbook includes:

#### 1. **Executive Summary**
- Threat overview in business language
- Potential impact
- Estimated response time

#### 2. **Investigation Phase**
- Steps to verify the threat
- Log files to examine
- Commands to run
- Evidence to collect

**Example**:
```
Step 1: Verify Apache Version
Command: apache2 -v
Expected Output: Server version: Apache/2.4.52
Purpose: Confirm vulnerable version is installed
```

#### 3. **Containment Phase**
- Immediate actions to prevent spread
- Isolation procedures
- Access restrictions

**Example**:
```
Step 1: Isolate Server from Network
Command: iptables -A INPUT -i eth0 -j DROP
Impact: Server will be unreachable from internet
Approval Required: Yes (Service disruption)
```

#### 4. **Eradication Phase**
- Steps to remove the threat
- Patching procedures
- Configuration changes

#### 5. **Recovery Phase**
- Restoring normal operations
- Validation testing
- Monitoring recommendations

#### 6. **Lessons Learned**
- Root cause analysis
- Process improvements
- Preventive measures

### Executing a Playbook

1. **Review Each Step**: Ensure you understand the action and its impact
2. **Check Approvals**: Some steps may require management approval
3. **Execute Sequentially**: Follow steps in order unless otherwise noted
4. **Document Actions**: 
   - Check off completed steps
   - Add notes on actual outcomes
   - Record any deviations from playbook
5. **Update Alert Status**: Change to "Investigating" or "Resolved"

### Customizing Playbooks

1. Click **"Edit Playbook"**
2. Modify steps as needed:
   - Add organization-specific procedures
   - Update commands for your environment
   - Add contact information for escalation
3. Save as template for future use

---

## Reporting

CyberGuard generates multiple report types for different audiences.

### Report Types

#### 1. **Executive Summary**
- **Audience**: CISOs, Management
- **Content**:
  - High-level security posture
  - Top threats and risks
  - Resource requirements
  - Business impact assessment
- **Format**: PDF with charts and business language
- **Frequency**: Weekly or on-demand

#### 2. **Technical Report**
- **Audience**: Security analysts, IT teams
- **Content**:
  - Detailed threat indicators (IPs, hashes, domains)
  - CVE details and CVSS scores
  - Affected systems list
  - Remediation steps
  - MITRE ATT&CK technique breakdown
- **Format**: PDF or JSON
- **Frequency**: Daily or on-demand

#### 3. **Compliance Report**
- **Audience**: Auditors, Compliance officers
- **Content**:
  - ISO 27001 control mappings
  - NIST Cybersecurity Framework alignment
  - Vulnerability management metrics
  - Incident response documentation
- **Format**: PDF
- **Frequency**: Monthly or for audits

### Generating Reports

1. Navigate to **Reports** section
2. Click **"Generate New Report"**
3. Configure report parameters:
   - **Type**: Select Executive, Technical, or Compliance
   - **Date Range**: Last week, Last month, Custom
   - **Include Sections**: 
     - Alert summary
     - Risk trends
     - Top threats
     - Remediation status
     - Asset inventory
   - **Format**: PDF, CSV, or JSON
4. Click **"Generate"**
5. Wait for generation (typically 30-60 seconds)
6. Download or email report

### Scheduling Reports

1. Go to **Settings** > **Report Scheduling**
2. Click **"Add Schedule"**
3. Configure:
   - Report type
   - Frequency (Daily, Weekly, Monthly)
   - Recipients (email addresses)
   - Time of day to send
4. Save schedule

### Viewing Past Reports

1. Navigate to **Reports** section
2. View report history with:
   - Title and type
   - Date range covered
   - Generated by (user)
   - Generated at (timestamp)
3. Click **"Download"** to retrieve

---

## System Configuration

**Access**: Admin and Manager roles only

### Threat Intelligence Settings

1. Navigate to **Settings** > **Threat Intelligence**
2. Configure:
   - **Polling Interval**: How often to check for new threats (default: 4 hours)
   - **Enabled Sources**: Select active threat feeds
     - NVD (National Vulnerability Database)
     - AlienVault OTX
     - ThreatFox
     - URLhaus
     - AbuseIPDB
   - **API Keys**: Enter credentials for each source

### Risk Scoring Configuration

1. Go to **Settings** > **Risk Scoring**
2. Adjust scoring weights (must total 100%):
   - CVSS Base Score: 40%
   - Exploit Availability: 20%
   - Asset Criticality: 20%
   - Network Exposure: 10%
   - Data Sensitivity: 10%
3. Set alert thresholds:
   - Critical: ≥80
   - High: ≥60
   - Medium: ≥40
   - Low: <40

### Notification Settings

1. Navigate to **Settings** > **Notifications**
2. Configure channels:
   - **Email**: Enter SMTP server details
   - **Dashboard**: Real-time alerts (always enabled)
   - **Slack** (optional): Add webhook URL
   - **Microsoft Teams** (optional): Add webhook URL
3. Set notification rules:
   - Notify on Critical alerts immediately
   - Daily digest for High alerts
   - Weekly summary for Medium/Low

### Integration Settings

1. Go to **Settings** > **Integrations**
2. Configure external systems:
   - **SIEM**: 
     - Enable bidirectional sync
     - Enter connection details
     - Map severity levels
   - **Ticketing System**:
     - Connect to Jira, ServiceNow, etc.
     - Auto-create tickets for Critical alerts
   - **Webhook**:
     - Add custom webhook URL
     - Send alert data to external systems

---

## User Roles & Permissions

CyberGuard implements role-based access control (RBAC).

### Available Roles

#### Security Analyst
**Permissions**:
- ✅ View all alerts and assets
- ✅ Investigate incidents
- ✅ Generate incident response playbooks
- ✅ Add notes to alerts
- ✅ Update alert status
- ✅ Create technical reports
- ❌ Delete assets
- ❌ Modify system configuration
- ❌ Manage users

**Use Case**: Day-to-day threat monitoring and incident response

#### CISO / Manager
**Permissions**:
- ✅ All Security Analyst permissions
- ✅ View executive reports
- ✅ Define risk policies
- ✅ Approve high-impact response actions
- ✅ Generate compliance reports
- ❌ Modify system configuration (read-only access)
- ❌ Manage users

**Use Case**: Oversight, decision-making, reporting to executives

#### Administrator
**Permissions**:
- ✅ All Manager permissions
- ✅ Manage assets (create, edit, delete)
- ✅ Configure system settings
- ✅ Manage user accounts
- ✅ Configure integrations
- ✅ Set up API keys
- ✅ View audit logs

**Use Case**: System administration, integration management

### Managing Users (Admins Only)

1. Navigate to **Settings** > **User Management**
2. View current users with roles
3. **Add User**:
   - Click "Invite User"
   - Enter email address
   - Assign role
   - Send invitation
4. **Edit User**:
   - Click on user
   - Change role or permissions
   - Disable account (temporary)
5. **Remove User**:
   - Click "Remove"
   - Confirm action
   - User loses all access immediately

---

## Best Practices

### Asset Management
- ✅ Keep asset inventory updated (review monthly)
- ✅ Use descriptive names (e.g., "Web-Server-01-Production")
- ✅ Accurately set criticality levels
- ✅ Document asset owners and dependencies
- ❌ Don't leave outdated assets in inventory

### Alert Investigation
- ✅ Prioritize by risk score, not just severity
- ✅ Document all investigation steps in notes
- ✅ Mark false positives to improve accuracy
- ✅ Assign alerts promptly (within 1 hour for Critical)
- ❌ Don't ignore Medium/Low alerts indefinitely

### Incident Response
- ✅ Review AI-generated playbooks before execution
- ✅ Get management approval for service-impacting actions
- ✅ Test containment steps in non-production first (if possible)
- ✅ Communicate with stakeholders throughout response
- ❌ Don't skip the "Lessons Learned" phase

### Reporting
- ✅ Schedule regular reports for stakeholders
- ✅ Tailor report type to audience (Executive vs Technical)
- ✅ Include trend analysis, not just point-in-time data
- ✅ Archive reports for audit compliance
- ❌ Don't overwhelm executives with technical details

### System Configuration
- ✅ Use strong API keys and rotate regularly (quarterly)
- ✅ Enable two-factor authentication for all users
- ✅ Test configuration changes in a test environment first
- ✅ Document all configuration changes
- ❌ Don't share admin credentials

---

## Troubleshooting

### Common Issues

#### "No alerts appearing on dashboard"

**Possible Causes**:
1. Threat intelligence sources not configured
2. Asset inventory empty (no assets to protect)
3. Risk thresholds set too high

**Solutions**:
- Check **Settings** > **Threat Intelligence** for API connectivity
- Verify assets are imported in **Assets** section
- Lower risk thresholds temporarily to confirm alerts are generating

---

#### "Alert generation very slow"

**Possible Causes**:
1. Large asset inventory (>1000 assets)
2. API rate limits reached
3. Database performance issues

**Solutions**:
- Increase polling interval in settings (reduce frequency)
- Upgrade to paid API tiers for higher rate limits
- Contact support for database optimization

---

#### "Playbook generation fails"

**Possible Causes**:
1. AI service (Groq API) unavailable
2. Network connectivity issues
3. Invalid API key

**Solutions**:
- Check API status at status.groq.com
- Verify internet connectivity
- Regenerate API key in **Settings** > **AI Services**

---

#### "Can't login"

**Possible Causes**:
1. Incorrect credentials
2. Account disabled
3. Browser cookies disabled

**Solutions**:
- Use "Forgot Password" to reset
- Contact administrator to reactivate account
- Enable cookies and clear browser cache

---

#### "Reports not generating"

**Possible Causes**:
1. No data in selected date range
2. Insufficient permissions
3. Report queue overloaded

**Solutions**:
- Verify alerts exist in the date range
- Ensure you have Manager/Admin role
- Wait a few minutes and retry

---

### Getting Help

**In-App Support**:
- Click the **"?"** icon (bottom right)
- Access contextual help for current page
- View video tutorials

**Contact Support**:
- Email: support@cyberguard.com
- Documentation: docs.cyberguard.com
- Community Forum: community.cyberguard.com

**Emergency Issues** (System Down, Critical Bug):
- Emergency hotline: [Contact your administrator]
- Response time: 1 hour during business hours

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick search (alerts, assets) |
| `Ctrl/Cmd + N` | Create new alert note |
| `Esc` | Close current modal |
| `→` / `←` | Navigate alerts in list |
| `Ctrl/Cmd + R` | Refresh current view |

---

**User Guide Version**: 1.0  
**Last Updated**: February 2025  
**Feedback**: userguide-feedback@cyberguard.com
