export interface Report {
    id: string
    title: string
    type: string
    status: string
    // from mock data
    generated?: string
    threats?: number
    resolved?: number
    download?: string
    // from ReportsList/ReportCard
    date?: string
    size?: string
    description?: string
}