"use client";

const heartbeatPath =
  "M0 78 H44 L60 78 L72 60 L84 104 L98 28 L116 128 L134 78 H188 L202 78 L214 64 L226 96 L240 42 L258 116 L274 78 H340 L354 78 L366 58 L378 102 L392 26 L410 126 L428 78 H500 L514 78 L526 66 L538 94 L552 50 L570 108 L586 78 H640";

const ambientLines = [
  "M0 42 C72 24 112 72 184 50 S322 24 396 50 526 76 640 42",
  "M0 112 C80 92 142 132 222 108 S362 84 450 110 560 134 640 106"
];

export function ResonanceWaveChart({ frequency }: { frequency?: number }) {
  const normalizedFrequency = Math.max(20, Math.min(2222, frequency || 432));
  const duration = Math.max(0.95, Math.min(3.6, 3.8 - (normalizedFrequency / 2222) * 2.65));
  const label = `${Math.round(normalizedFrequency)} Hz`;

  return (
    <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Resonance Waveform</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Signal Stability / Harmonic Drift / Resonance Phase</p>
        </div>
        <div className="text-right">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--success)] shadow-[0_0_18px_var(--success)]" />
          <p className="mt-2 font-display text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--accent)]">{label}</p>
        </div>
      </div>
      <svg viewBox="0 0 640 150" className="h-44 w-full overflow-visible">
        <defs>
          <filter id="waveGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="heartbeatFade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="18%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="52%" stopColor="var(--accent-2)" stopOpacity="1" />
            <stop offset="82%" stopColor="var(--accent-3)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="text-[var(--grid)]">
          {Array.from({ length: 8 }).map((_, index) => (
            <line key={`v-${index}`} x1={index * 91} x2={index * 91} y1="0" y2="150" stroke="currentColor" strokeWidth="1" />
          ))}
          {Array.from({ length: 5 }).map((_, index) => (
            <line key={`h-${index}`} x1="0" x2="640" y1={index * 37} y2={index * 37} stroke="currentColor" strokeWidth="1" />
          ))}
        </g>
        <g filter="url(#waveGlow)" fill="none" strokeLinecap="round">
          {ambientLines.map((line, index) => (
            <path
              key={line}
              d={line}
              stroke={index === 0 ? "var(--accent-2)" : "var(--accent-3)"}
              strokeWidth="1.5"
              opacity="0.32"
              className="animate-[wave-drift_6s_ease-in-out_infinite]"
              style={{ animationDelay: `${index * 0.8}s` }}
            />
          ))}
          <path d={heartbeatPath} stroke="var(--accent)" strokeWidth="9" opacity="0.16" />
          <path d={heartbeatPath} stroke="url(#heartbeatFade)" strokeWidth="3.5" className="heartbeat-line" style={{ animationDuration: `${duration}s` }} />
          <circle r="4" fill="var(--sand)" className="heartbeat-dot" style={{ animationDuration: `${duration}s` }} />
        </g>
      </svg>
      <div className="mt-2 flex items-center justify-between text-[0.68rem] uppercase tracking-[0.16em] text-[var(--muted)]">
        <span>Frequency-coupled trace</span>
        <span>{duration.toFixed(2)}s loop</span>
      </div>
    </div>
  );
}
