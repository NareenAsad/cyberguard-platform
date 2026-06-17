import type { Metadata } from 'next'
import Link from 'next/link'

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
                className="absolute top-6 left-6 inline-flex items-center px-4 py-2 rounded-xl bg-black text-primary text-sm font-medium border border-primary/20 hover:border-primary/60 hover:bg-black/80 transition-all duration-200"
            >
                Back
            </Link>
            {children}
        </div>
    )
}
