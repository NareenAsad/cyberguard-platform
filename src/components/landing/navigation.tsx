import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function Navigation() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 w-full backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="relative flex items-center justify-center w-8 md:w-10 h-8 md:h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="w-4 md:w-6 h-4 md:h-6 text-primary" />
        </div>
        <span className="text-base md:text-xl font-bold tracking-tight text-white">
          CyberGuard
        </span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/auth/login" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
          Sign In
        </Link>
        <Link href="/dashboard" className="group relative inline-flex h-8 md:h-9 items-center justify-center overflow-hidden rounded-md bg-primary px-3 md:px-4 py-2 font-medium text-[11px] md:text-sm text-slate-950 transition-all hover:bg-primary/90 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-slate-900 whitespace-nowrap">
          <span className="mr-1 md:mr-2">Get Started</span>
          <ArrowRight className="w-3 md:w-4 h-3 md:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </nav>
  );
}