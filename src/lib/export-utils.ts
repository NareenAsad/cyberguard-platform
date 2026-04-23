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
