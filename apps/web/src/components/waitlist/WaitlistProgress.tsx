"use client";

import { AnimatedNumber } from "@/components/AnimatedNumber";

const milestones = [
  [25, "Signal Found"],
  [50, "Node Field Stable"],
  [75, "Miner Layer Charging"],
  [100, "Resonance Queue Locked"]
] as const;

export function WaitlistProgress({ totalJoined, targetSlots }: { totalJoined: number; targetSlots: number }) {
  const percent = Math.min(100, Math.round((totalJoined / Math.max(1, targetSlots)) * 100));

  return (
    <div className="glass-panel rounded-[2rem] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Resonance slots filled</p>
          <p className="mt-3 text-3xl font-black text-[var(--text)]">
            <AnimatedNumber value={totalJoined} /> / {targetSlots}
          </p>
        </div>
        <p className="text-sm text-[var(--muted)]">{percent}% queue charge</p>
      </div>
      <div className="relative mt-6 h-5 overflow-hidden rounded-full border border-[var(--panel-border)] bg-[var(--bg)]">
        <div className="absolute inset-0 opacity-50 sand-field" />
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-[var(--sand)] via-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_28px_var(--glow)] transition-[width] duration-700"
          style={{ width: `${Math.max(3, percent)}%` }}
        >
          <span className="absolute inset-0 animate-[shimmer_1.8s_linear_infinite] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.32),transparent)]" />
          <span className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--sand)] blur-md" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {milestones.map(([point, label]) => (
          <div key={label} className={`rounded-2xl border p-3 ${percent >= point ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--text)]" : "border-[var(--panel-border)] bg-white/5 text-[var(--muted)]"}`}>
            <p className="font-display text-xs font-black uppercase tracking-[0.16em]">{point}%</p>
            <p className="mt-1 text-xs">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
