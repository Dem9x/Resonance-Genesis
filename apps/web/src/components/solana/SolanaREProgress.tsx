"use client";

import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";

export function SolanaREProgress({ value, max = 33 }: { value: number; max?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-bold text-[var(--muted)]">Claimable RE</span>
        <span className="font-black text-[var(--accent)]">{value.toFixed(2)} / {max} RE</span>
      </div>
      <AnimatedProgressBar value={value} max={max} />
    </div>
  );
}
