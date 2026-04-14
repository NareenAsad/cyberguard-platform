'use client'

import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth/auth-context'
import { getRoleLabel, getRoleBadgeColor } from '@/lib/auth/types'
import { logout } from '@/lib/auth/actions'

export function UserMenu() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    if (loading) {
        return (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        )
    }

    if (!user) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/auth/login')}
            >
                Sign In
            </Button>
        )
    }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email?.slice(0, 2).toUpperCase() || 'U'

    const handleLogout = async () => {
        await logout()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-muted/50"
                >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left hidden sm:flex">
                        <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                            {profile?.full_name || user.email?.split('@')[0]}
                        </span>
                        {profile?.role && (
                            <span className={`text-xs px-1.5 py-0.5 rounded border ${getRoleBadgeColor(profile.role)}`}>
                                {getRoleLabel(profile.role)}
                            </span>
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </DropdownMenuItem>

                {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
