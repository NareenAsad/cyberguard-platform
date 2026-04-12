'use client'

import { Bell, Settings, User } from 'lucide-react'

export function Header() {
  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-right justify-between">
      <div className="flex items-center gap-6">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-sm text-muted-foreground">System Healthy</span>
        </div>

        {/* Icons */}
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
