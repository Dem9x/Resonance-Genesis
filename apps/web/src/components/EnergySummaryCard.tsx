"use client";

import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { EstimatedEnergyNumber } from "@/components/EstimatedEnergyNumber";
import { MiniEnergyChart } from "@/components/MiniEnergyChart";

export function EnergySummaryCard({ totalPending, totalHashrate, dailyEmission }: { totalPending: bigint; totalHashrate: bigint; dailyEmission: number }) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">RE Power</p>
          <p className="mt-2 text-xs text-[var(--muted)]">Native resonance power accumulation</p>
        </div>
        <span className="rounded-full border border-[var(--panel-border)] bg-white/5 px-3 py-1 text-xs font-bold text-[var(--success)]">ACTIVE</span>
      </div>
      <p className="text-4xl font-black text-[var(--text)]">
        <EstimatedEnergyNumber baseEnergy={totalPending} hashrate={totalHashrate} isMining={totalHashrate > 0n} />
      </p>
      <div className="mt-4">
        <AnimatedProgressBar value={totalPending} max={10000} />
      </div>
      <div className="mt-5">
        <MiniEnergyChart />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted)]">
        <span>RE / day</span>
        <span className="font-bold text-[var(--text)]">
          <AnimatedNumber value={dailyEmission} suffix=" RE/day" />
        </span>
      </div>
    </div>
  );
}
