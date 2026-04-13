import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Switch Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
