import React from 'react'

const MARQUEE_ITEMS = [
  "5 Specialized AI Agents",
  "NVD & AlienVault OTX Integrations",
  "MITRE ATT&CK Mapping",
  "NIST Incident Playbooks",
  "Explainable Risk Scoring",
  "AI Incident Reports",
  "Real-Time WebSockets Alerting",
  "Hybrid Local Threat Database",
]

export function Marquee() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="relative border-y border-border/50 bg-card/25 py-5 overflow-hidden z-10">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-4 px-10 text-[10px] md:text-xs font-mono tracking-[0.2em] text-muted-foreground/85 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            {item}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
