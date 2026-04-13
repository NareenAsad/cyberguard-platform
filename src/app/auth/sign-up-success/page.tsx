import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Check Your Email
        </h1>
        <p className="text-muted-foreground mb-6">
          We&apos;ve sent you a confirmation email. Please click the link in the email to verify your account and complete the sign-up process.
        </p>
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or try signing up again with a different email address.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/auth/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  )
}
