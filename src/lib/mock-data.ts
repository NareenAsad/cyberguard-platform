// Mock data for CyberGuard dashboard
// This structure allows for easy backend integration later

export const dashboardMetrics = {
    threatsDetected: 2847,
    threatsDetectedChange: 12.5,
    riskScore: 42,
    riskScoreChange: -3.2,
    incidentsActive: 8,
    incidentsActiveChange: 2,
    systemsMonitored: 156,
    systemsMonitoredChange: 0,
}

export const chartData = [
    { name: 'Jan', threats: 400, detected: 240 },
    { name: 'Feb', threats: 520, detected: 320 },
    { name: 'Mar', threats: 680, detected: 420 },
    { name: 'Apr', threats: 750, detected: 580 },
    { name: 'May', threats: 920, detected: 720 },
    { name: 'Jun', threats: 1100, detected: 850 },
]

export const threatData = [
    {
        id: 'THR-001',
        type: 'Malware',
        severity: 'critical',
        source: '192.168.1.105',
        target: 'Database Server',
        detected: '2024-03-24 14:32:00',
        status: 'blocked',
    },
    {
        id: 'THR-002',
        type: 'DDoS',
        severity: 'high',
        source: '203.0.113.42',
        target: 'Web Server',
        detected: '2024-03-24 13:45:00',
        status: 'mitigating',
    },
    {
        id: 'THR-003',
        type: 'Phishing',
        severity: 'medium',
        source: '10.0.0.201',
        target: 'Email Gateway',
        detected: '2024-03-24 12:18:00',
        status: 'quarantined',
    },
    {
        id: 'THR-004',
        type: 'SQL Injection',
        severity: 'high',
        source: '172.16.0.88',
        target: 'API Server',
        detected: '2024-03-24 11:02:00',
        status: 'blocked',
    },
    {
        id: 'THR-005',
        type: 'Ransomware',
        severity: 'critical',
        source: '198.51.100.5',
        target: 'File Server',
        detected: '2024-03-24 09:55:00',
        status: 'isolated',
    },
]

export const riskAnalysis = [
    {
        asset: 'Production Database',
        riskLevel: 78,
        vulnerabilities: 12,
        exposureTime: '32 days',
        recommendation: 'Apply security patches immediately',
    },
    {
        asset: 'Web Application',
        riskLevel: 65,
        vulnerabilities: 8,
        exposureTime: '18 days',
        recommendation: 'Implement WAF rules',
    },
    {
        asset: 'Email Server',
        riskLevel: 45,
        vulnerabilities: 3,
        exposureTime: '7 days',
        recommendation: 'Update email filtering rules',
    },
    {
        asset: 'VPN Gateway',
        riskLevel: 58,
        vulnerabilities: 5,
        exposureTime: '42 days',
        recommendation: 'Review access controls',
    },
    {
        asset: 'File Server',
        riskLevel: 82,
        vulnerabilities: 15,
        exposureTime: '56 days',
        recommendation: 'Implement encryption and access controls',
    },
]

export const incidents = [
    {
        id: 'INC-2024-001',
        title: 'Unauthorized Database Access',
        severity: 'critical',
        status: 'in-progress',
        created: '2024-03-24 14:32:00',
        updated: '2024-03-24 15:20:00',
        assignee: 'John Davis',
        description: 'Multiple failed login attempts followed by successful access to production database.',
    },
    {
        id: 'INC-2024-002',
        title: 'DDoS Attack on Web Infrastructure',
        severity: 'high',
        status: 'in-progress',
        created: '2024-03-24 13:45:00',
        updated: '2024-03-24 14:50:00',
        assignee: 'Sarah Chen',
        description: 'Distributed denial of service attack from multiple IP addresses detected.',
    },
    {
        id: 'INC-2024-003',
        title: 'Suspicious Email Campaign',
        severity: 'medium',
        status: 'resolved',
        created: '2024-03-23 09:00:00',
        updated: '2024-03-24 11:30:00',
        assignee: 'Mike Wilson',
        description: 'Large volume of phishing emails attempting credential harvesting.',
    },
]

export const playbooks = [
    {
        id: 'PB-001',
        title: 'Ransomware Response',
        category: 'Incident Response',
        steps: 8,
        updatedBy: 'Security Team',
        lastUpdated: '2024-03-20',
        description: 'Step-by-step guide for responding to ransomware incidents',
    },
    {
        id: 'PB-002',
        title: 'Data Breach Protocol',
        category: 'Data Protection',
        steps: 12,
        updatedBy: 'Compliance Team',
        lastUpdated: '2024-03-15',
        description: 'Procedures for identifying and responding to data breaches',
    },
    {
        id: 'PB-003',
        title: 'DDoS Mitigation',
        category: 'Network Security',
        steps: 6,
        updatedBy: 'Network Team',
        lastUpdated: '2024-03-18',
        description: 'Automated and manual procedures for DDoS attack mitigation',
    },
    {
        id: 'PB-004',
        title: 'Malware Detection & Removal',
        category: 'Endpoint Security',
        steps: 10,
        updatedBy: 'Security Team',
        lastUpdated: '2024-03-22',
        description: 'Comprehensive guide for detecting and removing malware infections',
    },
]

export const reports = [
    {
        id: 'REP-001',
        title: 'Monthly Security Report - March 2024',
        type: 'Monthly Summary',
        generated: '2024-03-24',
        status: 'completed',
        threats: 2847,
        resolved: 2189,
        download: 'report-march-2024.pdf',
    },
    {
        id: 'REP-002',
        title: 'Vulnerability Assessment Report',
        type: 'Assessment',
        generated: '2024-03-20',
        status: 'completed',
        threats: 156,
        resolved: 89,
        download: 'vulnerability-assessment-march.pdf',
    },
    {
        id: 'REP-003',
        title: 'Compliance Audit Report',
        type: 'Compliance',
        generated: '2024-03-15',
        status: 'completed',
        threats: 42,
        resolved: 38,
        download: 'compliance-audit-q1-2024.pdf',
    },
]
