import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { SocketInitializer } from '@/components/socket-initializer'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
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
        </>
    )
}
