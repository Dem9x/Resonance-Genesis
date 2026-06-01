import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";

export function HashrateMeter({ value, label = "Chladni Hashrate" }: { value?: bigint | number; label?: string }) {
  const numeric = typeof value === "bigint" ? Number(value) : value || 0;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--accent)]">
          <AnimatedNumber value={numeric} suffix=" H/s" />
        </p>
      </div>
      <AnimatedProgressBar value={numeric} max={12000} />
      <p className="mt-3 text-xs text-[var(--muted)]">Derived from frequency, mode complexity, node density, line thickness, symmetry, and rarity multiplier.</p>
    </div>
  );
}
