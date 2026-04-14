export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-secondary/30 rounded-lg ${className || ''}`} />
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-secondary/30 rounded w-24"></div>
      <div className="h-10 bg-secondary/30 rounded w-32"></div>
      <div className="h-4 bg-secondary/30 rounded w-20"></div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-secondary/20 rounded-lg animate-pulse">
      <div className="h-8 bg-secondary/30 rounded flex-1"></div>
      <div className="h-8 bg-secondary/30 rounded flex-1"></div>
      <div className="h-8 bg-secondary/30 rounded flex-1"></div>
      <div className="h-8 bg-secondary/30 rounded flex-1"></div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-secondary/30 rounded w-48"></div>
      <div className="h-64 bg-secondary/20 rounded"></div>
    </div>
  )
}
