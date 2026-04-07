interface DataTableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  hoverable?: boolean
}

export function DataTable({ headers, rows, hoverable = true }: DataTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-semibold text-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-border ${
                  hoverable ? 'hover:bg-secondary/30 transition-colors' : ''
                } ${rowIndex % 2 === 0 ? 'bg-card' : 'bg-secondary/10'}`}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 text-sm text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  )
}
