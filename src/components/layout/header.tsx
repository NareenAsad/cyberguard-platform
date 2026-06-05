'use client'

import { useEffect, useState } from 'react'
import { Bell, Shield } from 'lucide-react'
import { UserMenu } from '../auth/user-menu'
import { checkAgentHealth } from '@/lib/agent-client'
import { initSocket } from '@/lib/socket/socket'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Notification {
  id: string
  title: string
  time: string
  read: boolean
}

export function Header() {
  const [isHealthy, setIsHealthy] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Welcome to CyberGuard Security Operations Center', time: new Date().toISOString(), read: false }
  ])

  useEffect(() => {
    let mounted = true
    
    // Check Agent Health periodically
    const pollHealth = async () => {
      const healthy = await checkAgentHealth()
      if (mounted) setIsHealthy(healthy)
    }
    
    pollHealth()
    const interval = setInterval(pollHealth, 10000)

    // Socket Notifications
    const socket = initSocket()

    // alert:new — fired after AI agent saves threats/risks/incidents to DB
    const handleAlert = (data: any) => {
      if (!mounted) return
      setNotifications(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        title: data?.title
          ? `${data.title}${data.message ? ': ' + data.message : ''}`
          : 'New security alert detected',
        time: data?.timestamp || new Date().toISOString(),
        read: false,
        severity: data?.severity || 'info',
      } as any, ...prev].slice(0, 50))
    }

    // metrics:update — fired when posture score changes
    const handleMetrics = (data: any) => {
      if (!mounted) return
      if (data?.criticalCount > 0) {
        setNotifications(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          title: `Security posture update: ${data.criticalCount} critical, ${data.highCount ?? 0} high issues`,
          time: new Date().toISOString(),
          read: false,
        }, ...prev].slice(0, 50))
      }
    }

    // page:refresh — data was saved, tell the user
    const handlePageRefresh = (data: any) => {
      if (!mounted) return
      if (data?.page === 'threats') {
        setNotifications(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          title: 'New threats detected and saved to database',
          time: new Date().toISOString(),
          read: false,
        }, ...prev].slice(0, 50))
      }
    }

    socket.on('alert:new', handleAlert)
    socket.on('metrics:update', handleMetrics)
    socket.on('page:refresh', handlePageRefresh)

    return () => {
      mounted = false
      clearInterval(interval)
      socket.off('alert:new', handleAlert)
      socket.off('metrics:update', handleMetrics)
      socket.off('page:refresh', handlePageRefresh)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between z-20 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden md:block">
          CyberGuard
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`}></div>
          <span className="text-sm text-muted-foreground">{isHealthy ? 'System Healthy' : 'System Degraded'}</span>
        </div>

        {/* Icons */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 border-border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
              <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <ScrollArea className="h-[320px]">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 border-b border-border last:border-0 hover:bg-secondary/40 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <p className={`text-sm ${!notif.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-1.5">
                        {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <Bell className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}

