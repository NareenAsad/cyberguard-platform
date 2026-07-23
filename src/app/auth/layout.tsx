import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Authentication - CyberGuard',
    description: 'Sign in to CyberGuard Security Operations Dashboard',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
            <Link
                href="/"
                className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/40 hover:bg-primary/20 hover:border-primary transition-all duration-200"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Link>
            {children}
        </div>
    )
}
