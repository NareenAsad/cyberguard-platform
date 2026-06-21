'use client'

import { Wifi, WifiOff } from 'lucide-react'

interface RealtimeToggleProps {
    enabled: boolean
    onToggle: (val: boolean) => void
}

export function RealtimeToggle({ enabled, onToggle }: RealtimeToggleProps) {
    return (
        <div className="flex items-center justify-between px-1 py-1">
            {/* Left — icon + label + badge */}
            <div className="flex items-center gap-3">
                {enabled ? (
                    <Wifi className="w-4 h-4 text-primary shrink-0" />
                ) : (
                    <WifiOff className="w-4 h-4 text-slate-500 shrink-0" />
                )}

                <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium text-slate-200 select-none">
                        Real-Time Monitoring
                    </span>

                    {enabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-bold text-primary uppercase tracking-widest">
                            {/* Pulsing dot */}
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                            </span>
                            Live
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-600/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span className="inline-flex rounded-full h-1.5 w-1.5 bg-slate-500" />
                            Paused
                        </span>
                    )}
                </div>
            </div>

            {/* Right — description + toggle */}
            <div className="flex items-center gap-4">
                <p className="text-xs text-slate-500 hidden sm:block">
                    {enabled
                        ? 'Dashboard updates every 10–30 s via Socket.io'
                        : 'Data frozen — safe to analyse current state'}
                </p>

                {/* Toggle switch — uses CSS variable --primary (electric cyan) */}
                <button
                    id="realtime-toggle-btn"
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Toggle real-time monitoring"
                    onClick={() => onToggle(!enabled)}
                    className={`
                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full
                        border-2 transition-colors duration-200 ease-in-out focus:outline-none
                        ${enabled
                            ? 'bg-primary border-primary'
                            : 'bg-slate-700 border-slate-600'
                        }
                    `}
                >
                    <span
                        className={`
                            inline-block h-4 w-4 transform rounded-full bg-white shadow-md
                            transition-transform duration-200 ease-in-out
                            ${enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}
                        `}
                    />
                </button>
            </div>
        </div>
    )
}
