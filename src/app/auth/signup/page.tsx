'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { signup } from '@/lib/auth/actions'

const ROLES = [
    { value: 'analyst', label: 'Security Analyst', description: 'View threats and incidents' },
    { value: 'manager', label: 'Security Manager', description: 'Manage team and review reports' },
    { value: 'admin', label: 'Administrator', description: 'Full system access' },
]

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState('analyst')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        formData.set('role', selectedRole)

        const result = await signup(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            setSuccess(true)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-md">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-chart-3/10 border border-chart-3/20">
                            <CheckCircle2 className="w-8 h-8 text-chart-3" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            Check Your Email
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {"We've sent you a confirmation link. Please check your email to verify your account."}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardFooter>
                    <Link href="/auth/login" className="w-full">
                        <Button variant="outline" className="w-full">
                            Return to Sign In
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        )
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
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Join CyberGuard Security Operations Center
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
                        <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                            Full Name
                        </label>
                        <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="John Doe"
                            required
                            autoComplete="name"
                            className="bg-input/50 border-border focus:border-primary"
                        />
                    </div>

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
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="bg-input/50 border-border focus:border-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium text-foreground">
                            Role
                        </label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="bg-input/50 border-border focus:border-primary">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                        <div className="flex flex-col">
                                            <span>{role.label}</span>
                                            <span className="text-xs text-muted-foreground">{role.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
