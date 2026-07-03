'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { UserMenu } from '../auth/user-menu'
import { NotificationBell } from './notification-bell'

export function Header() {
  const [isHealthy, setIsHealthy] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Check Agent Health periodically
    const pollHealth = async () => {
      try {
        const res = await fetch('/api/agents/health')
        const data = await res.json()
        if (mounted) setIsHealthy(!!data.healthy)
      } catch {
        if (mounted) setIsHealthy(false)
      }
    }
    
    pollHealth()
    const interval = setInterval(pollHealth, 10000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between z-20 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white hidden md:block">
          CyberGuard
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
          <span className="text-sm text-muted-foreground">{isHealthy ? 'System Healthy' : 'System Degraded'}</span>
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}
