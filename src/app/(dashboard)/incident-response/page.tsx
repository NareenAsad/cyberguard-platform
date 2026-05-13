'use client'

import { useState, useEffect } from 'react'
import type { Incident } from '@/types/incident'
import { PageHeader } from '@/components/shared/page-header'
import { IncidentsList } from '@/components/incident-response/incidents-list'
import { IncidentDetails } from '@/components/incident-response/incident-details'
import { incidentAPI } from '@/lib/api-service'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/export-utils'
import { usePageRefresh } from '@/hooks/use-page-refresh'

export default function IncidentResponsePage() {
    usePageRefresh('incident-response')
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchIncidents = async () => {
            setLoading(true)
            try {
                const data = await incidentAPI.getIncidents()
                if (Array.isArray(data)) {
                    setIncidents(data)
                    setSelectedIncident(data[0] ?? null)
                }
            } catch (error) {
                console.error("Failed to fetch incidents:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchIncidents()
    }, [])

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Incident Response"
                    description="Manage active incidents and playbook execution"
                />
                <button 
                    onClick={() => exportToCSV(incidents, 'incidents-export')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {loading ? (
                <div>Loading incidents...</div>
            ) : (
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
            )}
        </div>
    )
}
