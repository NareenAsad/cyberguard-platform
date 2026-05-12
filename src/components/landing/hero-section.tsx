import Link from "next/link";

export function HeroSection() {
  return (
    <main className="relative z-10 flex flex-col items-center pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        AI-Driven Threat Intelligence and Incident Response System
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.15]">
        Security that works at <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500">
          Machine Speed.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 leading-relaxed">
        Classic systems and human-powered processes simply cannot keep up. Transition from a reactive to a proactive security posture with our multi-agent architecture. We provide automatic threat data aggregation, human-level reasoning, and automated response playbooks.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link href="/dashboard" className="inline-flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-sm font-medium text-slate-950 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105">
          Launch Dashboard
        </Link>
        <Link href="#features" className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-secondary/50 backdrop-blur-md px-8 text-sm font-medium text-foreground transition-all hover:bg-secondary hover:border-border/80">
          Explore Features
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">95%</div>
          <div className="text-sm text-muted-foreground font-medium">Verified Accuracy Rate</div>
        </div>
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-4xl font-bold text-emerald-400 mb-2">70%</div>
          <div className="text-sm text-muted-foreground font-medium">Detection Time Reduction</div>
        </div>
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="text-4xl font-bold text-teal-400 mb-2">60%</div>
          <div className="text-sm text-muted-foreground font-medium">Response Time Reduction</div>
        </div>
      </div>
    </main>
  );
}

