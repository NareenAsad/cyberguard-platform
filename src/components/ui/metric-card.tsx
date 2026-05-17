import { ArrowUp, ArrowDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number | string
  change?: number
  unit?: string
  icon?: React.ReactNode
}

export function MetricCard({ title, value, change, unit, icon }: MetricCardProps) {
  const isPositive = change && change > 0
  
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground">
            {value}
            {unit && <span className="text-lg text-muted-foreground ml-1">{unit}</span>}
          </p>
        </div>
        {icon && <div className="text-primary opacity-60">{icon}</div>}
      </div>
      
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUp className="w-4 h-4 text-destructive" />
          ) : (
            <ArrowDown className="w-4 h-4 text-green-400" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-destructive' : 'text-green-400'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  )
}
