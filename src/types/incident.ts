export interface Incident {
    id: string
    title: string
    description: string
    severity: string
    status?: string
    created?: string
    updated?: string
    assignee?: string
    incidentId?: string
}