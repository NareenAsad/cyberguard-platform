import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SocketInitializer } from '@/components/socket-initializer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// Metadata
export const metadata: Metadata = {
  title: 'CyberGuard - AI-Driven Threat Intelligence and Incident Response System',
  description: 'Enterprise cybersecurity threat detection and incident response platform with real-time monitoring',
}

// Viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className="dark scroll-smooth"
      suppressHydrationWarning
    >
      <body className={`${inter.variable} font-sans antialiased`}>

        {/* Initialize WebSocket globally */}
        <SocketInitializer />

        <div className="flex h-screen bg-background text-foreground">
          <Sidebar />

          <div className="flex flex-col flex-1 w-full md:w-auto">
            <Header />

            <main className="flex-1 overflow-auto w-full">
              {children}
            </main>
          </div>
        </div>

        <Analytics />
      </body>
    </html>
  )
}