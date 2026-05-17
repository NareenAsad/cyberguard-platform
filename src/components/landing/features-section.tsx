import { BrainCircuit, Network, Activity, CheckCircle2 } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 py-24 border-t border-border bg-muted/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The missing link in Modern Defense</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Centralizing specialized AI agents that monitor global threat landscapes and cross-reference them against your organization's specific assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Network className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multi-Agent Architecture</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Centralized AI agent activity provides human-level reasoning blended with automated response playbooks for comprehensive defense.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-3xl bg-card border border-border hover:border-primary/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Explainable AI</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Transparent reasoning chains ensure security teams can have complete faith in the system's automated judgments and actions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-3xl bg-card border border-border hover:border-accent/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Proactive Neutralization</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Stop reacting. Threats are automatically identified and neutralized before they can escalate, protecting your assets 24/7.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-card border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Enterprise-Grade, Democratized</h3>
            <p className="text-muted-foreground max-w-xl">
              Get high-end security features at less than 5% of the price of conventional commercial platforms. We believe robust security should be accessible to everyone.
            </p>
          </div>
          <ul className="space-y-3">
            {['Cost Effective', 'High Performance', 'Scalable Architecture'].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

