'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { RiskDistribution } from '@/components/risk-analysis/risk-distribution'
import { RiskPrioritization } from '@/components/risk-analysis/risk-prioritization'
import { RiskStatistics } from '@/components/risk-analysis/risk-statistics'
import { riskAPI } from '@/lib/api-service'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import { usePageRefresh } from '@/hooks/use-page-refresh'

export default function RiskAnalysisPage() {
    usePageRefresh('risk-analysis')
    const [riskAnalysis, setRiskAnalysis] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRisks = async () => {
            setLoading(true)
            try {
                const data = await riskAPI.getRisks()
                if (data) {
                    setRiskAnalysis(data)
                }
            } catch (error) {
                console.error("Failed to fetch risk analysis:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRisks()
    }, [])

    const chartData = riskAnalysis.map(item => ({
        name: item.assetName?.substring(0, 10) || 'Unknown',
        riskLevel: item.riskLevel,
        vulnerabilities: Math.floor(item.riskLevel / 10), // mock stat since not in db directly
    }))

    const sortedByRisk = [...riskAnalysis].sort((a, b) => b.riskLevel - a.riskLevel)

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Risk Analysis"
                    description="Asset vulnerabilities and exposure assessment"
                />
                <button 
                    onClick={() => exportToCSV(riskAnalysis, 'risk-analysis-export')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {loading ? (
                <div>Loading risk analysis...</div>
            ) : (
                <>
                    <RiskDistribution data={chartData} />
                    <RiskPrioritization risks={sortedByRisk} />
                    <RiskStatistics risks={riskAnalysis} />
                </>
            )}
        </div>
    )
}
