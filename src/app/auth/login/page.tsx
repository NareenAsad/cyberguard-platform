'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/lib/auth/actions'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
        // If successful, the server action will redirect
    }

    return (
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-md">
            <CardHeader className="space-y-4 text-center">
                <div className="flex justify-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-foreground">
                        Welcome to CyberGuard
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Sign in to access the Security Operations Dashboard
                    </CardDescription>
                </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="analyst@cyberguard.com"
                            required
                            autoComplete="email"
                            className="bg-input/50 border-border focus:border-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                            autoComplete="current-password"
                            className="bg-input/50 border-border focus:border-primary"
                        />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pt-6">
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                        {"Don't have an account? "}
                        <Link
                            href="/auth/signup"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Create account
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
