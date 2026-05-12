import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <Header />
            <div className="flex flex-1 overflow-hidden w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
