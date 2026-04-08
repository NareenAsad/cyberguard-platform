'use client'

interface PlaybookCategoriesProps {
  categories: string[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function PlaybookCategories({
  categories,
  selectedCategory,
  onSelectCategory,
}: PlaybookCategoriesProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 h-fit">
      <h3 className="font-semibold text-foreground mb-4">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-primary/20 text-primary border border-primary'
              : 'text-muted-foreground hover:bg-secondary'
          }`}
        >
          All Playbooks
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category
                ? 'bg-primary/20 text-primary border border-primary'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}
