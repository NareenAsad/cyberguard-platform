'use client'
import Link from "next/link";
import { useEffect, useState } from "react";

const THREATS = [
  { id: "THR-7734", type: "CVE-2024-44228", severity: "CRITICAL", status: "NEUTRALIZED", time: "00:03s" },
  { id: "THR-7735", type: "Malicious IP", severity: "HIGH", status: "BLOCKED", time: "00:07s" },
  { id: "THR-7736", type: "Phishing Domain", severity: "HIGH", status: "ANALYZING", time: "00:12s" },
  { id: "THR-7737", type: "Log4Shell Exploit", severity: "CRITICAL", status: "NEUTRALIZED", time: "00:19s" },
  { id: "THR-7738", type: "Ransomware C2", severity: "CRITICAL", status: "BLOCKED", time: "00:24s" },
];

const SEV: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-500/10 border-red-500/30",
  HIGH: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};
const STATUS: Record<string, string> = {
  NEUTRALIZED: "text-emerald-400",
  BLOCKED: "text-primary",
  ANALYZING: "text-amber-400 animate-pulse",
};

function ThreatFeed() {
  const [visible, setVisible] = useState(2);
  useEffect(() => {
    const t = setTimeout(() => setVisible(THREATS.length), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="w-full rounded-lg md:rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden shadow-lg md:shadow-2xl shadow-primary/5">
      {/* Terminal header */}
      <div className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 md:py-3 border-b border-border/60 bg-background/40 flex-wrap">
        <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-amber-500/70" />
        <span className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 md:ml-3 text-[8px] md:text-[10px] text-muted-foreground/85 font-mono uppercase tracking-wider whitespace-nowrap">cyberguard — threat-monitor</span>
        <span className="ml-auto flex items-center gap-1 text-[8px] md:text-[10px] text-emerald-400 font-mono tracking-wider whitespace-nowrap">
          <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          LIVE
        </span>
      </div>
      {/* Threats */}
      <div className="divide-y divide-border/40 max-h-[250px] md:max-h-none overflow-y-auto">
        {THREATS.slice(0, visible).map((t, i) => (
          <div key={t.id} className="flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-2.5 text-[9px] md:text-xs font-mono flex-wrap"
            style={{ animation: `fadeIn 0.4s ease ${i * 0.15}s both` }}>
            <span className="text-muted-foreground/40 flex-shrink-0">{t.time}</span>
            <span className="text-muted-foreground/60 flex-shrink-0">{t.id}</span>
            <span className="flex-1 text-foreground/80 truncate text-[8px] md:text-xs">{t.type}</span>
            <span className={`px-1.5 md:px-2 py-0.5 rounded border text-[7px] md:text-[9px] font-bold uppercase flex-shrink-0 ${SEV[t.severity]}`}>
              {t.severity}
            </span>
            <span className={`font-bold text-[7px] md:text-[9px] uppercase text-right flex-shrink-0 ${STATUS[t.status]}`}>
              {t.status}
            </span>
          </div>
        ))}
      </div>
      <div className="px-2 md:px-4 py-2 border-t border-border/40 bg-background/20 flex items-center gap-2">
        <span className="text-[9px] md:text-xs font-mono text-muted-foreground/60 flex-shrink-0">▊</span>
        <span className="text-[8px] md:text-[10px] font-mono text-primary/70 tracking-wide animate-pulse truncate">scanning global threat feeds...</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <main className="relative z-10 pt-8 md:pt-0 pb-12 md:pb-16 px-4 md:px-6 w-full">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center min-h-auto lg:min-h-[500px] max-w-7xl mx-auto">

        {/* Left — text */}
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-7">
          {/* User customized tag string */}
          <div className="inline-flex w-fit items-center gap-2 px-3 md:px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-mono uppercase tracking-wider">
            <span className="relative flex h-1.5 md:h-2 w-1.5 md:w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-full w-full bg-primary" />
            </span>
            <span className="truncate md:whitespace-normal">AI-Driven Threat Intelligence</span>
          </div>

          <h1 className="font-sans text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
            Security that<br />
            <span className="text-primary">
              works at machine speed.
            </span>
          </h1>

          <p className="text-xs md:text-base text-muted-foreground leading-relaxed font-normal max-w-lg">
            Continuously monitor your infrastructure and let specialized AI agents automatically detect and contain security threats in seconds.
          </p>

          {/* Agent pills with elegant fonts */}
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {["Threat Intel", "Vulnerability", "Risk", "Incident", "Reporting"].map((a) => (
              <span key={a} className="px-2 md:px-2 py-0.5 md:py-1 rounded-full border border-border bg-secondary/35 text-[8px] md:text-[10px] font-mono text-muted-foreground/80 tracking-wide uppercase whitespace-nowrap">
                {a}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2">
            <Link href="/dashboard"
              className="inline-flex h-10 md:h-11 items-center justify-center rounded-lg bg-primary px-4 md:px-8 text-[11px] md:text-xs font-mono uppercase tracking-widest text-slate-950 font-bold transition-all duration-300 hover:bg-primary/90 whitespace-nowrap"
            >
              Launch Dashboard →
            </Link>
            <Link href="#features"
              className="inline-flex h-10 md:h-11 items-center justify-center rounded-lg border border-border bg-secondary/35 backdrop-blur-md px-4 md:px-8 text-[11px] md:text-xs font-mono uppercase tracking-widest text-foreground transition-all hover:bg-secondary/50 whitespace-nowrap"
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Right — live threat feed */}
        <div className="flex flex-col gap-3 md:gap-5 lg:col-span-5 w-full">
          <ThreatFeed />
          {/* Mini stats below terminal in monospace layout */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {[
              { val: "95%", label: "Accuracy" },
              { val: "70%", label: "Faster" },
              { val: "60%", label: "Response" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl bg-card border border-border/60">
                <div className="text-base md:text-xl font-black font-sans text-primary tracking-wide">{s.val}</div>
                <div className="text-[7px] md:text-[9px] font-mono text-muted-foreground/80 text-center uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}