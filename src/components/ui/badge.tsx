interface BadgeProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive/20 text-destructive',
    success: 'bg-accent/20 text-accent',
    warning: 'bg-yellow-500/20 text-yellow-400',
    info: 'bg-primary/20 text-primary',
    outline: 'border border-current bg-transparent',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

