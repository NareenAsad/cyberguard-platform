import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function Navigation() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
          CyberGuard
        </span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200">
          Sign In
        </Link>
        <Link href="/dashboard" className="group relative inline-flex h-9 items-center justify-center overflow-hidden rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition-all hover:bg-emerald-400 hover:ring-2 hover:ring-emerald-400 hover:ring-offset-2 hover:ring-offset-slate-900">
          <span className="mr-2">Get Started</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </nav>
  );
}

