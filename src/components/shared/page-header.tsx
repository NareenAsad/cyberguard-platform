interface PageHeaderProps {
    title: string
    description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-sm md:text-base text-muted-foreground">{description}</p>
        </div>
    )
}
