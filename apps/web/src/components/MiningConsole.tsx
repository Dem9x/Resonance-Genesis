"use client";

import { useEffect, useState } from "react";

const defaultLogs = [
  "NODE #12 activated",
  "frequency lock acquired",
  "sand field coherence stable",
  "resonance energy accumulated",
  "claim cycle ready"
];

export function MiningConsole({ logs = defaultLogs }: { logs?: string[] }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    const timers = logs.map((_, index) => window.setTimeout(() => setVisible(index + 1), 180 + index * 210));
    return () => timers.forEach(window.clearTimeout);
  }, [logs]);

  return (
    <div className="glass-panel scanlines relative overflow-hidden rounded-[1.75rem] p-5">
      <div className="absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-[var(--accent)]/10 to-transparent" />
      <div className="absolute inset-0 opacity-40 archive-grid" />
      <div className="relative mb-5 flex items-center justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Mining Console</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Live miner event stream</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--bg)]/60 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--success)]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--success)] shadow-[0_0_18px_var(--success)]" />
          Active
        </span>
      </div>
      <div className="relative min-h-44 space-y-3 font-mono text-sm text-[var(--muted)]">
        {logs.map((log, index) => (
          <p key={`${log}-${index}`} className={`transition duration-500 ${index < visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
            <span className="text-[var(--accent)]">[{String(index + 1).padStart(2, "0")}]</span> {log}
          </p>
        ))}
        <p className="text-[var(--accent-2)]">
          <span className="mr-2">[{String(logs.length + 1).padStart(2, "0")}]</span>
          listening<span className="ml-1 inline-block h-4 w-2 animate-[cursor-blink_1s_steps(1)_infinite] bg-[var(--accent-2)] align-[-2px]" />
        </p>
      </div>
    </div>
  );
}
