'use client'

import { useState } from 'react'
import { incidents } from '@/lib/mock-data'
import { PageHeader } from '@/components/shared/page-header'
import { IncidentsList } from '@/components/incident-response/incidents-list'
import { IncidentDetails } from '@/components/incident-response/incident-details'

export default function IncidentResponsePage() {
    const [selectedIncident, setSelectedIncident] = useState(incidents[0])

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <PageHeader
                title="Incident Response"
                description="Manage active incidents and playbook execution"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <IncidentsList
                        incidents={incidents}
                        selectedIncident={selectedIncident}
                        onSelect={setSelectedIncident}
                    />
                </div>

                <div className="lg:col-span-2">
                    <IncidentDetails incident={selectedIncident} />
                </div>
            </div>
        </div>
    )
}
