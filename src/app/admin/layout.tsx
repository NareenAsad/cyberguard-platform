import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-col flex-1 w-full md:w-auto">
                <Header />
                <main className="flex-1 overflow-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
