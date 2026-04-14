'use client'

import { useState } from 'react'
import { threatData } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { ThreatFilters } from '@/components/threats/threat-filters'
import { ThreatsTable } from '@/components/threats/threats-table'
import { ThreatsSummary } from '@/components/threats/threats-summary'

export default function ThreatsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    const filteredThreats = threatData.filter(threat => {
        const matchesSearch = threat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            threat.source.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSeverity = !selectedSeverity || threat.severity === selectedSeverity
        const matchesStatus = !selectedStatus || threat.status === selectedStatus

        return matchesSearch && matchesSeverity && matchesStatus
    })

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <PageHeader
                title="Threats"
                description="Monitor and manage detected security threats"
            />

            <ThreatFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedSeverity={selectedSeverity}
                onSeverityChange={setSelectedSeverity}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            <ThreatsTable threats={filteredThreats} />

            <ThreatsSummary threats={threatData} />
        </div>
    )
}
