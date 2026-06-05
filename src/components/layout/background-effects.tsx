export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
      {/* Soft neon cyber glows */}
      <div className="absolute -top-[10%] left-[20%] w-[70%] h-[60%] bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(0,229,255,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-[30%] -right-[10%] w-[60%] h-[50%] bg-[radial-gradient(ellipse_60%_50%_at_80%_30%,rgba(0,230,118,0.035)_0%,transparent_60%)]" />

      {/* Structural grid lines inspired by the reference template */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  )
}
