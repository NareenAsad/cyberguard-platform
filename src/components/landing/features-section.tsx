import { BrainCircuit, Network, Activity, Database, FileText, Shield, CheckCircle2 } from "lucide-react";

const PIPELINE = [
  { step: "01", title: "Continuous Aggregation", desc: "Collect logs and threat data from real-time feeds including NVD, AlienVault OTX, ThreatFox, and AbuseIPDB." },
  { step: "02", title: "MITRE ATT&CK Enrichment", desc: "Correlate IOCs against active CVE lists and enrich with structured MITRE tactics and techniques." },
  { step: "03", title: "AI-Collaborative Reasoning", desc: "Coordinate 5 specialized AI agents to analyze alerts, assess severity, and audit context." },
  { step: "04", title: "Explainable Risk Scoring", desc: "Assign custom risk levels (0-100) detailing the exact reason why an asset is flagged." },
  { step: "05", title: "NIST Playbook Remediation", desc: "Deploy containment, isolation, and remediation steps aligned to industry-standard frameworks." },
];

const AGENTS = [
  {
    role: "Threat Intelligence Agent",
    tag: "INGESTION",
    desc: "Ingests raw indicators, filters out duplicates, and parses exploitation scores dynamically from public databases.",
    highlight: true,
  },
  {
    role: "Vulnerability Scan Agent",
    tag: "CORRELATION",
    desc: "Correlates newly discovered CVEs against your local asset database, assessing immediate surface vulnerability exposure.",
    highlight: false,
  },
  {
    role: "Risk Analysis Agent",
    tag: "EVALUATION",
    desc: "Calculates overall platform security posture scores, analyzing criticality and generating clear explanation chains.",
    highlight: false,
  },
  {
    role: "Incident Response Agent",
    tag: "MITIGATION",
    desc: "Formulates containment workplans, isolates suspicious addresses, and prepares recovery pipelines for authorization.",
    highlight: false,
  },
  {
    role: "Reporting & Audit Agent",
    tag: "DOCUMENTATION",
    desc: "Compiles complete incident summaries, generates executive, technical, and compliance reports ready for export.",
    highlight: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 py-16 md:py-24 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-16 md:space-y-28">

        {/* ── Pipeline: How It Works ── */}
        <div>
          <div className="mb-12 md:mb-16">
            <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary uppercase">How We Work</span>
            <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white mt-3 md:mt-4">
              From raw threat data to<br />
              <span className="text-primary">automated response.</span>
            </h2>
          </div>

          {/* Premium step structure from the reference design */}
          <div className="flex flex-col border-t border-border/50">
            {PIPELINE.map((p, i) => (
              <div 
                key={i} 
                className="group grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[100px_2fr_3fr] gap-4 md:gap-6 lg:gap-12 py-6 md:py-10 border-b border-border/50 hover:bg-card/20 transition-all duration-300 px-3 md:px-4 items-start md:items-center"
              >
                <span className="font-mono text-2xl md:text-3xl lg:text-4xl font-black text-primary/40 group-hover:text-primary transition-colors flex-shrink-0">
                  {p.step}
                </span>
                <h3 className="font-sans text-base md:text-lg lg:text-xl font-bold text-white leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-light">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Agent Specialists Grid ── */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-end mb-12 md:mb-16">
            <div>
              <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary uppercase">The Specialists</span>
              <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white mt-3 md:mt-4">
                Meet the AI agents<br />
                <span className="text-primary font-black">behind your defense.</span>
              </h2>
            </div>
            <p className="text-xs md:text-base text-muted-foreground leading-relaxed font-light max-w-md lg:mb-2">
              Each specialized agent performs a critical stage of the analysis lifecycle, collaborating autonomously before handing off data logs.
            </p>
          </div>

          {/* AI Agent Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {AGENTS.map((a, i) => (
              <div
                key={i}
                className={`group relative p-5 md:p-8 rounded-xl md:rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[240px] md:min-h-[260px] ${
                  a.highlight
                    ? "bg-gradient-to-br from-primary/10 via-card to-card border-primary/30 hover:border-primary/50"
                    : "bg-card border-border/70 hover:border-primary/20 hover:bg-card/80"
                }`}
              >
                {/* Glow filter */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-500" />
                
                <div className="relative space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[8px] md:text-[9px] font-bold tracking-widest text-primary/60 border border-primary/25 rounded px-2 py-0.5 uppercase">
                      {a.tag}
                    </span>
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors flex-shrink-0" />
                  </div>
                  <h3 className="font-sans text-base md:text-lg font-bold text-white group-hover:text-primary transition-colors pt-2">
                    {a.role}
                  </h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed font-light pt-1">
                    {a.desc}
                  </p>
                </div>

                <div className="relative pt-4 md:pt-6 flex items-center gap-1.5 text-[8px] md:text-[10px] font-mono text-primary/60 group-hover:text-primary tracking-wider uppercase transition-colors">
                  <span>Agent Online</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Enterprise Value Banner ── */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-6 md:p-10 lg:p-14">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-5xl mx-auto space-y-6 md:space-y-8">
            {/* Centered label at the top */}
            <div className="text-center">
              <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-primary uppercase">Open Source · Enterprise Grade</span>
            </div>

            {/* Split layout: left column for text, right column for features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
              {/* Left Column — Title and description */}
              <div className="flex flex-col gap-3 md:gap-4 text-left">
                <h2 className="font-sans text-xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  Less than 5% of the cost.<br />
                  <span className="text-primary">100% of capability.</span>
                </h2>
                <p className="text-xs md:text-base text-muted-foreground leading-relaxed font-light">
                  Built on Llama 3 via Groq, CrewAI, Next.js, and Supabase — CyberGuard gives SMEs enterprise-level threat intelligence without the enterprise price tag.
                </p>
              </div>

              {/* Right Column — Feature checklist */}
              <div className="flex flex-col gap-3 md:gap-4 md:pl-6 lg:pl-8 border-t md:border-t-0 md:border-l border-primary/10 pt-4 md:pt-0">
                {["Role-Based Access", "WebSocket Updates", "Explainable AI", "PDF Export", "NIST Playbooks"].map((f) => (
                  <span key={f} className="flex items-center gap-2 md:gap-3 text-[9px] md:text-xs font-mono tracking-wider uppercase text-muted-foreground">
                    <CheckCircle2 className="w-3 md:w-4 h-3 md:h-4 text-primary flex-shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}