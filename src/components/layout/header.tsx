'use client'

import { Bell, Settings, User } from 'lucide-react'
import { UserMenu } from '../auth/user-menu'

export function Header() {
  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-end">
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

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
