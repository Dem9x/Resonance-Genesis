export function FormulaPanel() {
  return (
    <div className="glass-panel relative overflow-hidden rounded-3xl p-6">
      <div className="absolute inset-0 opacity-25 archive-grid" />
      <div className="relative">
        <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Chladni Math Layer</p>
        <div className="mt-4 space-y-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-4 font-mono text-sm text-[var(--text)]">
          <p>f(x,y) = cos(n*x)cos(m*y) - cos(m*x)cos(n*y)</p>
          <p>z(x,y) = sin(nπx/L)sin(mπy/L)</p>
          <p>z(x,y,t) = A * sin(nπx/L) * sin(mπy/L) * cos(ωt)</p>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          Solidity uses integer approximations derived from the same concepts: frequency weight, mode crossing complexity, node density, line thickness, symmetry bonus, and rarity multiplier.
        </p>
      </div>
    </div>
  );
}
