import { Bell, Settings } from 'lucide-react'
import { UserNav } from '@/components/user-nav'
import { getCurrentUser } from '@/lib/auth'

export async function AuthHeader() {
  const user = await getCurrentUser()

  return (
    <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Security Operations</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-2">
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
        
        {/* User Navigation */}
        {user ? (
          <UserNav user={{ email: user.email, profile: user.profile }} />
        ) : null}
      </div>
    </header>
  )
}
