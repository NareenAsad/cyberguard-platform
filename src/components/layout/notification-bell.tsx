'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { onAlert } from '@/lib/socket/socket'

interface AlertNotification {
    id: string
    type: string
    title: string
    message: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    timestamp: string
}

interface StoredNotification extends AlertNotification {
    read: boolean
}

const MAX_NOTIFICATIONS = 20

const SEVERITY_DOT: Record<AlertNotification['severity'], string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
    info: 'bg-primary',
}

function timeAgo(iso: string): string {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

export function NotificationBell() {
    // In-memory only — resets on refresh. Populated live from the 'alert:new'
    // socket event (see docs/WEBSOCKET.md); no history is fetched or persisted.
    const [notifications, setNotifications] = useState<StoredNotification[]>([])
    const [open, setOpen] = useState(false)

    const unreadCount = notifications.filter((n) => !n.read).length

    useEffect(() => {
        return onAlert((data: AlertNotification) => {
            setNotifications((prev) => [{ ...data, read: false }, ...prev].slice(0, MAX_NOTIFICATIONS))
        })
    }, [])

    // Opening the panel no longer bulk-marks everything read — each item
    // keeps its own read/unread state so you can tell what's new and flag
    // something back as unread for later.
    const toggleRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)))
    }

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    aria-label="Notifications"
                    className="relative flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30 transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-80 p-0 isolate bg-popover">
                {/* Explicit solid background at every nested layer — Radix's
                    ScrollArea nested inside an animated (transform: scale)
                    Popover can otherwise fail to fully paint its background
                    in Chromium, letting page content behind it bleed through. */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-popover rounded-t-md">
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={() => setNotifications([])}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground bg-popover rounded-b-md">
                        No notifications yet
                    </p>
                ) : (
                    // A fixed height (not max-height) is required here — Radix's
                    // ScrollArea Viewport sizes itself to 100% of this container,
                    // and percentage heights don't reliably resolve against an
                    // auto-height parent constrained only by max-height, so the
                    // panel was growing off-screen instead of scrolling.
                    <ScrollArea className="h-80 bg-popover rounded-b-md">
                        <ul className="divide-y divide-border bg-popover">
                            {notifications.map((n) => (
                                <li key={n.id} className={`flex items-start gap-3 px-4 py-3 bg-popover ${!n.read ? 'bg-primary/5' : ''}`}>
                                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[n.severity] ?? SEVERITY_DOT.info}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm truncate ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.timestamp)}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleRead(n.id)}
                                        aria-label={n.read ? 'Mark as unread' : 'Mark as read'}
                                        title={n.read ? 'Mark as unread' : 'Mark as read'}
                                        className="shrink-0 mt-1.5 w-4 h-4 rounded-full flex items-center justify-center group"
                                    >
                                        <span
                                            className={`w-2 h-2 rounded-full transition-colors ${n.read
                                                ? 'border border-muted-foreground/40 group-hover:border-primary'
                                                : 'bg-primary group-hover:bg-primary/70'
                                                }`}
                                        />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                )}
            </PopoverContent>
        </Popover>
    )
}
