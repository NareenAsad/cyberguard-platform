'use client'

import { riskAnalysis } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { RiskDistribution } from '@/components/risk-analysis/risk-distribution'
import { RiskPrioritization } from '@/components/risk-analysis/risk-prioritization'
import { RiskStatistics } from '@/components/risk-analysis/risk-statistics'

export default function RiskAnalysisPage() {
    const chartData = riskAnalysis.map(item => ({
        name: item.asset.substring(0, 10),
        riskLevel: item.riskLevel,
        vulnerabilities: item.vulnerabilities * 5,
    }))

    const sortedByRisk = [...riskAnalysis].sort((a, b) => b.riskLevel - a.riskLevel)

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <PageHeader
                title="Risk Analysis"
                description="Asset vulnerabilities and exposure assessment"
            />

            <RiskDistribution data={chartData} />
            <RiskPrioritization risks={sortedByRisk} />
            <RiskStatistics risks={riskAnalysis} />
        </div>
    )
}
