import { AlertTriangle } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 p-4 rounded-full bg-accent/10">
        {icon || <AlertTriangle className="w-8 h-8 text-accent" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
    </div>
  )
}
