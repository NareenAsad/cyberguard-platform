/**
 * Exports an array of objects to a CSV file and triggers download
 */
export function exportToCSV(data: any[], filename: string) {
    if (!data || !data.length) {
        console.warn('No data to export')
        return
    }

    const keys = Object.keys(data[0])
    const csvContent = [
        keys.join(','),
        ...data.map(row => 
            keys.map(key => {
                const cell = row[key] === null || row[key] === undefined ? '' : String(row[key])
                // Escape quotes and wrap in quotes
                return `"${cell.replace(/"/g, '""')}"`
            }).join(',')
        )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}

/**
 * Generates a PDF document using native browser print
 */
export function exportToPDF(
    title: string, 
    data: any[], 
    columns: { header: string, dataKey: string }[], 
    filename: string
) {
    if (!data || !data.length) {
        console.warn('No data to export')
        return
    }

    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const tableHeaders = columns.map(c => `<th>${c.header}</th>`).join('')
    const tableRows = data.map(row => {
        return `<tr>${columns.map(c => `<td>${row[c.dataKey] ?? ''}</td>`).join('')}</tr>`
    }).join('')

    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: system-ui, sans-serif; padding: 20px; color: #0f172a; }
                    h1 { font-size: 24px; margin-bottom: 5px; }
                    .date { font-size: 12px; color: #64748b; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
                    th { background-color: #f1f5f9; font-weight: 600; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="date">Generated: ${new Date().toLocaleString()}</div>
                <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <script>
                    window.onload = () => {
                        window.print();
                        // Optional: automatically close the window after printing
                        // setTimeout(() => window.close(), 500);
                    }
                </script>
            </body>
        </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
}

/**
 * Exports a full rich security report to PDF using browser print
 * Mirrors the ReportDetailPanel content exactly
 */
export function exportReportToPDF(report: {
    id: string
    title: string
    type: string
    status: string
    generated?: string
    date?: string
    description?: string
    threats?: number
    content?: {
        executive_report?: {
            posture_score?: number
            top_risk?: string
            severity_summary?: Record<string, number>
            action_required?: string
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
    } | null
}) {
    const printWindow = window.open('', '', 'width=900,height=700')
    if (!printWindow) return

    const exec = report.content?.executive_report
    const tech = report.content?.technical_report
    const comp = report.content?.compliance_report
    const displayDate = report.generated || report.date
    const formattedDate = displayDate
        ? new Date(displayDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    // ── Executive Summary Section ─────────────────────────────────────────────
    const executiveHTML = exec ? `
        <section>
            <div class="section-header">
                <span class="section-icon">📊</span>
                <h2>Executive Summary</h2>
            </div>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-label">Posture Score</div>
                    <div class="metric-value green">${exec.posture_score ?? '—'}%</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Critical Issues</div>
                    <div class="metric-value red">${exec.severity_summary?.critical ?? 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">High Issues</div>
                    <div class="metric-value orange">${exec.severity_summary?.high ?? 0}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Action Count</div>
                    <div class="metric-value blue">${exec.action_required ? 1 : 0}</div>
                </div>
            </div>
            ${exec.top_risk ? `
                <div class="threat-box">
                    <div class="threat-label">⚠ Primary Threat</div>
                    <p class="threat-text">${exec.top_risk}</p>
                </div>
            ` : ''}
            ${exec.action_required ? `
                <div class="info-box">
                    <div class="info-label">Recommended Action</div>
                    <p class="info-text">${exec.action_required}</p>
                </div>
            ` : ''}
        </section>
    ` : ''

    // ── Technical Findings Section ────────────────────────────────────────────
    const patchesHTML = (tech?.immediate_patches ?? []).length > 0 ? `
        <div class="subsection">
            <h3>🔧 Required Remediation Patches</h3>
            ${tech!.immediate_patches!.map(p => `
                <div class="patch-card">
                    <div class="patch-header">
                        <span class="cve-id">${p.cve_id}</span>
                        <span class="asset-name">${p.asset}</span>
                    </div>
                    <code class="patch-cmd">${p.patch_command}</code>
                    ${p.patch_url ? `<a class="patch-url" href="${p.patch_url}" target="_blank">${p.patch_url}</a>` : ''}
                </div>
            `).join('')}
        </div>
    ` : ''

    const iocsHTML = (tech?.ioc_summary ?? []).length > 0 ? `
        <div class="subsection">
            <h3>🚨 Indicators of Compromise</h3>
            <table class="ioc-table">
                <thead>
                    <tr><th>Type</th><th>Value</th><th>Associated Threat</th></tr>
                </thead>
                <tbody>
                    ${tech!.ioc_summary!.map(ioc => `
                        <tr>
                            <td><span class="badge red">${ioc.type}</span></td>
                            <td class="mono">${ioc.value}</td>
                            <td>${ioc.threat}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    ` : ''

    const assetsHTML = (tech?.assets_at_risk ?? []).length > 0 ? `
        <div class="subsection">
            <h3>🖥 Assets at Risk</h3>
            <div class="tag-list">
                ${tech!.assets_at_risk!.map(a => `<span class="tag orange">${a}</span>`).join('')}
            </div>
        </div>
    ` : ''

    const rulesHTML = (tech?.detection_rules ?? []).length > 0 ? `
        <div class="subsection">
            <h3>📡 Detection Rules</h3>
            ${tech!.detection_rules!.map(r => `
                <div class="rule-card">
                    <div class="rule-name">${r.rule_name}</div>
                    <div class="rule-meta">Source: <strong>${r.log_source}</strong></div>
                    <p class="rule-desc">${r.description}</p>
                </div>
            `).join('')}
        </div>
    ` : ''

    const technicalHTML = tech ? `
        <section>
            <div class="section-header">
                <span class="section-icon">🛡</span>
                <h2>Technical Findings</h2>
            </div>
            ${tech.total_findings != null ? `<p class="findings-count">Total Findings: <strong>${tech.total_findings}</strong></p>` : ''}
            ${patchesHTML}${iocsHTML}${assetsHTML}${rulesHTML}
        </section>
    ` : ''

    // ── Compliance Section ────────────────────────────────────────────────────
    const complianceHTML = comp ? `
        <section>
            <div class="section-header">
                <span class="section-icon">📋</span>
                <h2>Compliance &amp; Governance</h2>
            </div>
            ${comp.overall_compliance_score != null ? `
                <div class="compliance-score-row">
                    <span>Overall Compliance Score</span>
                    <span class="compliance-score-value">${comp.overall_compliance_score}%</span>
                </div>
                <div class="compliance-bar-bg">
                    <div class="compliance-bar-fill" style="width: ${comp.overall_compliance_score}%"></div>
                </div>
            ` : ''}
            ${comp.frameworks_assessed && comp.frameworks_assessed.length > 0 ? `
                <div class="subsection">
                    <h3>Frameworks Assessed</h3>
                    <div class="tag-list">
                        ${comp.frameworks_assessed.map(f => `<span class="tag green">${f}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${(comp.controls_violated ?? []).length > 0 ? `
                <div class="subsection">
                    <h3>Controls Violated</h3>
                    ${comp.controls_violated!.map(v => `
                        <div class="violation-card">
                            <div class="violation-header">
                                <span class="violation-id">${v.control_id}</span>
                                <span class="violation-name">${v.control_name}</span>
                            </div>
                            <p class="violation-finding">${v.finding}</p>
                            <p class="violation-remediation"><strong>Remediation:</strong> ${v.remediation}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </section>
    ` : ''

    // ── Full HTML Document ────────────────────────────────────────────────────
    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>${report.title}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    background: #ffffff;
                    color: #1e293b;
                    font-size: 13px;
                    line-height: 1.6;
                }

                /* ── Page Header ── */
                .report-header {
                    background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
                    color: #f8fafc;
                    padding: 36px 40px 28px;
                    border-bottom: 3px solid #00e5ff;
                }
                .header-meta { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
                .badge {
                    display: inline-block;
                    padding: 2px 10px;
                    border-radius: 999px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .badge.green { background: rgba(0,230,118,0.2); color: #00e676; border: 1px solid rgba(0,230,118,0.35); }
                .badge.blue  { background: rgba(6,182,212,0.2); color: #06b6d4; border: 1px solid rgba(6,182,212,0.35); }
                .badge.red   { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.35); }
                .badge.orange{ background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.35); }
                .report-title { font-size: 26px; font-weight: 800; color: #f8fafc; margin-bottom: 6px; }
                .report-meta-row { font-size: 11px; color: #94a3b8; display: flex; gap: 20px; flex-wrap: wrap; }
                .report-meta-row span { display: flex; align-items: center; gap: 4px; }

                /* ── Body ── */
                .report-body { padding: 32px 40px; display: flex; flex-direction: column; gap: 32px; }

                /* ── Sections ── */
                section { page-break-inside: avoid; }
                .section-header {
                    display: flex; align-items: center; gap: 10px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 10px; margin-bottom: 16px;
                }
                .section-icon { font-size: 18px; }
                .section-header h2 {
                    font-size: 14px; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 0.08em;
                    color: #0f172a;
                }

                /* ── Metrics ── */
                .metrics-grid {
                    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;
                }
                .metric-card {
                    background: #f8fafc; border: 1px solid #e2e8f0;
                    border-radius: 10px; padding: 14px 12px; text-align: center;
                }
                .metric-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin-bottom: 6px; }
                .metric-value { font-size: 22px; font-weight: 900; }
                .metric-value.green  { color: #00e676; }
                .metric-value.red    { color: #ef4444; }
                .metric-value.orange { color: #f59e0b; }
                .metric-value.blue   { color: #06b6d4; }

                /* ── Threat/Info box ── */
                .threat-box {
                    background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.25);
                    border-radius: 10px; padding: 14px 16px; margin-top: 12px;
                }
                .threat-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #ef4444; margin-bottom: 6px; }
                .threat-text { font-size: 13px; color: #1e293b; }
                .info-box {
                    background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.2);
                    border-radius: 10px; padding: 14px 16px; margin-top: 10px;
                }
                .info-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #06b6d4; margin-bottom: 6px; }
                .info-text { font-size: 13px; color: #1e293b; }

                /* ── Subsections ── */
                .subsection { margin-top: 20px; }
                .subsection h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; margin-bottom: 10px; }
                .findings-count { font-size: 12px; color: #475569; margin-bottom: 8px; }

                /* ── Patch cards ── */
                .patch-card {
                    background: #f8fafc; border: 1px solid #e2e8f0;
                    border-radius: 8px; padding: 12px 14px; margin-bottom: 8px;
                }
                .patch-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .cve-id { font-weight: 800; font-size: 12px; color: #0f172a; }
                .asset-name { font-size: 11px; color: #64748b; }
                .patch-cmd {
                    display: block; background: #0f172a; color: #00e676;
                    font-family: 'Courier New', monospace; font-size: 11px;
                    padding: 8px 10px; border-radius: 6px; word-break: break-all;
                    margin-bottom: 4px;
                }
                .patch-url { font-size: 10px; color: #06b6d4; word-break: break-all; }

                /* ── IOC Table ── */
                .ioc-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .ioc-table th, .ioc-table td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
                .ioc-table th { background: #f1f5f9; font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
                .mono { font-family: 'Courier New', monospace; font-size: 11px; color: #ef4444; }

                /* ── Tags ── */
                .tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
                .tag {
                    padding: 3px 10px; border-radius: 999px;
                    font-size: 11px; font-weight: 600;
                }
                .tag.green  { background: rgba(0,230,118,0.1); color: #00e676; border: 1px solid rgba(0,230,118,0.25); }
                .tag.orange { background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.25); }

                /* ── Detection Rules ── */
                .rule-card {
                    border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 10px 14px; margin-bottom: 8px;
                }
                .rule-name { font-weight: 700; font-size: 12px; color: #0f172a; }
                .rule-meta { font-size: 10px; color: #64748b; margin: 2px 0 4px; }
                .rule-desc { font-size: 12px; color: #475569; }

                /* ── Compliance ── */
                .compliance-score-row {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 6px;
                }
                .compliance-score-value { font-size: 22px; font-weight: 900; color: #00e676; }
                .compliance-bar-bg {
                    background: #e2e8f0; border-radius: 999px; height: 8px; margin-bottom: 16px;
                    overflow: hidden;
                }
                .compliance-bar-fill { background: linear-gradient(90deg, #00e676, #00e5ff); height: 100%; border-radius: 999px; }
                .violation-card {
                    border-left: 3px solid #f59e0b; background: rgba(245,158,11,0.04);
                    border-radius: 0 8px 8px 0; padding: 10px 14px; margin-bottom: 8px;
                }
                .violation-header { display: flex; gap: 10px; align-items: center; margin-bottom: 4px; }
                .violation-id { font-weight: 800; font-size: 11px; color: #f59e0b; }
                .violation-name { font-weight: 600; font-size: 12px; color: #0f172a; }
                .violation-finding { font-size: 12px; color: #475569; margin-bottom: 4px; }
                .violation-remediation { font-size: 11px; color: #64748b; }

                /* ── Footer ── */
                .report-footer {
                    margin-top: 40px; padding: 20px 40px;
                    border-top: 1px solid #e2e8f0;
                    display: flex; justify-content: space-between; align-items: center;
                    font-size: 10px; color: #94a3b8;
                }
                .footer-brand { font-weight: 700; color: #00e5ff; font-size: 12px; }

                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    section { page-break-inside: avoid; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <!-- Header -->
            <div class="report-header">
                <div class="header-meta">
                    <span class="badge green">${report.status}</span>
                    <span class="badge blue">${report.type}</span>
                </div>
                <div class="report-title">${report.title}</div>
                <div class="report-meta-row">
                    <span>📅 ${formattedDate}</span>
                    <span>🔖 ID: ${report.id}</span>
                    ${report.threats != null ? `<span>⚠ ${report.threats} Threats Detected</span>` : ''}
                    <span>🕐 Exported: ${new Date().toLocaleString()}</span>
                </div>
            </div>

            <!-- Body -->
            <div class="report-body">
                ${executiveHTML}
                ${technicalHTML}
                ${complianceHTML}
                ${!exec && !tech && !comp ? `
                    <div style="text-align:center; padding: 60px 20px; color: #94a3b8;">
                        <div style="font-size: 40px; margin-bottom: 16px;">📄</div>
                        <p style="font-size: 15px; font-weight: 600; color: #475569;">No detailed content available for this report.</p>
                        <p style="font-size: 12px; margin-top: 6px;">Basic metadata is shown in the header above.</p>
                    </div>
                ` : ''}
            </div>

            <!-- Footer -->
            <div class="report-footer">
                <span class="footer-brand">CyberGuard</span>
                <span>AI-Driven Threat Intelligence Platform</span>
                <span>Confidential — Internal Use Only</span>
            </div>

            <script>
                window.onload = () => window.print();
            </script>
        </body>
        </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
}
