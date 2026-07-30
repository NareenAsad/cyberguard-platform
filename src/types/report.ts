export interface ReportContentData {
    executive_report?: {
        posture_score?: number
        posture_label?: string
        top_risk?: string
        severity_summary?: Record<string, number>
        action_required?: string
        business_impact?: string
        key_findings?: string[]
        recommended_priorities?: Array<{
            priority: number
            action: string
            owner?: string
            deadline?: string
        }>
    }
    technical_report?: {
        total_findings?: number
        assets_at_risk?: string[]
        immediate_patches?: Array<{
            cve_id: string
            asset: string
            patch_command: string
            patch_url?: string
        }>
        detection_rules?: Array<{
            rule_name: string
            description: string
            log_source: string
        }>
        ioc_summary?: Array<{
            type: string
            value: string
            threat: string
        }>
    }
    compliance_report?: {
        frameworks_assessed?: string[]
        overall_compliance_score?: number
        controls_violated?: Array<{
            control_id: string
            control_name: string
            finding: string
            remediation: string
        }>
        nist_csf_mapping?: Record<string, string | number>
    }
}

export interface Report {
    id: string
    title: string
    type: string
    status: string
    content?: unknown
    generated?: string
    threats?: number
    resolved?: number
    download?: string
    date?: string
    size?: string
    description?: string
}
