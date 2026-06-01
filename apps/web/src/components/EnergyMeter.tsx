import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { EstimatedEnergyNumber } from "@/components/EstimatedEnergyNumber";

export function EnergyMeter({
  value,
  max = 1000,
  label = "RE Power",
  hashrate,
  isMining = false
}: {
  value: number;
  max?: number;
  label?: string;
  hashrate?: bigint;
  isMining?: boolean;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--accent)]">
          {hashrate ? <EstimatedEnergyNumber baseEnergy={BigInt(Math.trunc(value))} hashrate={hashrate} isMining={isMining} /> : <AnimatedNumber value={value} suffix=" RE" />}
        </p>
      </div>
      <AnimatedProgressBar value={value} max={max} />
      <p className="mt-3 text-xs text-[var(--muted)]">{percent}% charge toward the next utility cycle.</p>
    </div>
  );
}
