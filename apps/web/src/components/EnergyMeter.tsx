export function EnergyMeter({ value, max = 1000, label = "Resonance Energy" }: { value: number; max?: number; label?: string }) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
        <p className="text-sm font-bold text-[var(--accent)]">{value.toLocaleString()} RE</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] shadow-[0_0_22px_var(--glow)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">{percent}% charge toward the next utility cycle.</p>
    </div>
  );
}
