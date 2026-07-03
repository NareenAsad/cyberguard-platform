'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { onMetricsUpdate } from '@/lib/socket/socket'
import { getStoredRealtimeEnabled, onRealtimeToggle } from '@/lib/realtime-toggle-events'
import {
  LayoutDashboard,
  AlertTriangle,
  TrendingUp,
  Zap,
  BookOpen,
  FileText,
  Shield,
  Menu,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Threats', href: '/threats', icon: AlertTriangle },
  { name: 'Risk Analysis', href: '/risk-analysis', icon: TrendingUp },
  { name: 'Incident Response', href: '/incident-response', icon: Zap },
  { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [lastUpdatedIso, setLastUpdatedIso] = useState<string | null>(null)

  // Mirrors the Dashboard's Real-Time Monitoring toggle (shared via
  // localStorage + a custom event — see lib/realtime-toggle-events.ts) so
  // this timestamp freezes too when the user pauses live updates, instead
  // of quietly ticking away and implying fresher data than what's shown.
  const realtimeEnabledRef = useRef(true)

  useEffect(() => {
    realtimeEnabledRef.current = getStoredRealtimeEnabled()
    return onRealtimeToggle((enabled) => {
      realtimeEnabledRef.current = enabled
    })
  }, [])

  useEffect(() => {
    let mounted = true

    // Initial value from API response metadata.
    fetch('/api/dashboard/metrics')
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return
        const ts = json?.timestamp || json?.data?.generatedAt
        if (ts) setLastUpdatedIso(ts)
      })
      .catch(() => {
        // Keep "No updates yet" if API is unavailable.
      })

    const updateNow = () => {
      if (mounted) setLastUpdatedIso(new Date().toISOString())
    }

    // Update on AI analysis completion — always, even while paused, since
    // this is an explicit user-triggered result rather than a live tick.
    window.addEventListener('ai-analysis:completed', updateNow)

    // Update whenever the socket pushes live metrics, but only while
    // real-time monitoring isn't paused.
    const unsubSocket = onMetricsUpdate(() => {
      if (realtimeEnabledRef.current) updateNow()
    })

    return () => {
      mounted = false
      window.removeEventListener('ai-analysis:completed', updateNow)
      unsubSocket()
    }
  }, [])

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedIso) return 'No updates yet'
    const dt = new Date(lastUpdatedIso)
    if (Number.isNaN(dt.getTime())) return 'No updates yet'
    return dt.toLocaleString('en-GB', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    })
  }, [lastUpdatedIso])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 p-2 md:hidden bg-primary text-primary-foreground rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'text-primary bg-primary/5'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="px-4 py-3 rounded-lg bg-sidebar-accent/10 border border-sidebar-accent/20">
            <p className="text-xs text-sidebar-foreground/80">
              Last Update
            </p>
            <p className="text-xs text-primary font-medium mt-1">
              {lastUpdatedLabel}
            </p>
          </div>
        </div>
      </aside >

      {/* Mobile Overlay */}
      {
        isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )
      }
    </>
  )
}
