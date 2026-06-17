'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { ThreatFilters } from '@/components/threats/threat-filters'
import { ThreatsTable } from '@/components/threats/threats-table'
import { ThreatsSummary } from '@/components/threats/threats-summary'
import { threatsAPI } from '@/lib/api-service'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import { usePageRefresh } from '@/hooks/use-page-refresh'

export default function ThreatsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [threats, setThreats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchThreats = async () => {
        setLoading(true)
        try {
            const data = await threatsAPI.getThreats()
            if (data) {
                setThreats(data)
            }
        } catch (error) {
            console.error("Failed to fetch threats:", error)
        } finally {
            setLoading(false)
        }
    }

    usePageRefresh('threats', fetchThreats)

    useEffect(() => {
        fetchThreats()
    }, [])

    const filteredThreats = threats.filter(threat => {
        const matchesSearch = threat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            threat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            threat.source?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity = !selectedSeverity || threat.severity === selectedSeverity
        const matchesStatus = !selectedStatus || threat.status === selectedStatus

        return matchesSearch && matchesSeverity && matchesStatus
    })

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Threats"
                    description="Monitor and manage detected security threats"
                />
                <button 
                    onClick={() => exportToCSV(filteredThreats, 'threats-export')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <ThreatFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedSeverity={selectedSeverity}
                onSeverityChange={setSelectedSeverity}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            {loading ? (
                <div>Loading threats...</div>
            ) : (
                <>
                    <ThreatsTable threats={filteredThreats} />
                    <ThreatsSummary threats={threats} />
                </>
            )}
        </div>
    )
}
