'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  Users,
  Settings,
} from 'lucide-react'
import type { UserRole } from '@/lib/auth'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  roles?: UserRole[] // If undefined, accessible to all authenticated users
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Threats', href: '/threats', icon: AlertTriangle },
  { name: 'Risk Analysis', href: '/risk-analysis', icon: TrendingUp },
  { name: 'Incident Response', href: '/incident-response', icon: Zap },
  { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'User Management', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'manager'] },
]

interface SidebarProps {
  userRole?: UserRole
}

export function Sidebar({ userRole = 'analyst' }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

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
        className={`fixed md:relative w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-sidebar-primary shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-lg text-sidebar-foreground truncate">CyberGuard</div>
              <div className="text-xs text-sidebar-accent truncate">Security Platform</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
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
            <p className="text-xs text-sidebar-accent font-medium">
              Mar 24, 14:32 UTC
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
