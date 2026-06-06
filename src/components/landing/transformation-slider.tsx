'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Shield, ShieldAlert, ArrowLeftRight, Activity, Database, CheckCircle2 } from 'lucide-react'

export function TransformationSlider() {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percent)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return
    handleMove(e.clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX)
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [])

  return (
    <section id="results" className="relative z-10 py-24 border-t border-border/50 bg-background/50">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left column - Content */}
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs tracking-[0.25em] text-primary uppercase">Incident Transformation</span>
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
            See the security<br />
            <span className="text-primary">
              transformation.
            </span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-md">
            Compare manual legacy security tools against CyberGuard's multi-agent automation. Drag the divider to reveal how 5 specialized AI agents transform threat investigation from days of manual work to seconds of automatic containment.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/80">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Before: Unmapped logs
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              After: 5 AI agents
            </div>
          </div>
        </div>

        {/* Right column - Draggable slider container */}
        <div 
          ref={containerRef}
          className="relative h-[480px] w-full rounded-2xl border border-border/80 bg-card overflow-hidden select-none cursor-ew-resize shadow-2xl shadow-primary/5"
          onMouseDown={(e) => {
            isDragging.current = true
            handleMove(e.clientX)
          }}
          onTouchStart={(e) => {
            isDragging.current = true
            if (e.touches.length > 0) {
              handleMove(e.touches[0].clientX)
            }
          }}
        >
          {/* AFTER panel (Back layer - visible when dragged right) */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card/90 to-primary/5 flex flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-mono text-xs text-primary uppercase font-bold tracking-wider">CyberGuard Active SOC</span>
              </div>
              <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono text-emerald-400 font-bold uppercase">
                Mitigated in 00:03s
              </span>
            </div>

            {/* Structured AI Agent analysis cards */}
            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-primary/20 bg-primary/5">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-mono text-primary font-bold">01</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-xs font-bold text-foreground">Threat Ingested & Mapped</h4>
                    <span className="text-[9px] font-mono text-muted-foreground/80">MITRE T1190</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">CVE-2024-44228 correlation completed. Exploit vector categorized.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-accent/20 bg-accent/5">
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-mono text-accent font-bold">02</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-xs font-bold text-foreground">5-Agent Collaboration</h4>
                    <span className="text-[9px] font-mono text-accent">Risk: 88/100</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">Vulnerability & Risk agents confirmed exposure. Playbook agent triggered.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-primary/20 bg-primary/5">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-foreground">Automated NIST Playbook Fired</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">Assets isolated. Traffic redirected. SOC notification dispatched via WebSocket.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60 border-t border-border/50 pt-4">
              <Database className="w-3.5 h-3.5 text-primary" />
              <span>Database updated. Threat lake log archived in 3.4ms</span>
            </div>
          </div>

          {/* BEFORE panel (Front layer - clipped) */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20 flex flex-col justify-between p-8 border-r border-red-500/20"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <span className="font-mono text-xs text-red-500 uppercase font-bold tracking-wider">Unmonitored Endpoint</span>
              </div>
              <span className="px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-[10px] font-mono text-red-400 font-bold uppercase animate-pulse">
                200+ Days Breach Gap
              </span>
            </div>

            {/* Chaotic raw logs */}
            <div className="flex-1 flex flex-col justify-center font-mono text-[10px] text-red-400/75 leading-normal space-y-2 overflow-hidden my-4">
              <div>[WARN] 192.168.1.104 attempted login failed: invalid user admin</div>
              <div>[CRIT] CVE-2024-44228 exploit attempt detected from 45.132.88.9</div>
              <div>[WARN] Host system root privilege escalation triggered by PID 9942</div>
              <div>[ERR] Manual security response queue timeout (24 hours elapsed)</div>
              <div>[WARN] DB connection query spikes on client db-cluster-0</div>
              <div className="text-[11px] text-red-500 font-bold bg-red-500/10 p-2 border border-red-500/20 rounded">
                SYSTEM COMPROMISED: Remote code execution succeeded. Data egress detected.
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-red-500/60 border-t border-red-500/10 pt-4">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              <span>Continuous threat exposure — No response actions mapped.</span>
            </div>
          </div>

          {/* Draggable vertical bar divider */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-primary z-20 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary border border-slate-950 flex items-center justify-center shadow-lg shadow-primary/50 pointer-events-auto cursor-ew-resize">
              <ArrowLeftRight className="w-4 h-4 text-slate-950" />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
