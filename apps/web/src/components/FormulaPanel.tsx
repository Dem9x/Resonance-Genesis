export function FormulaPanel() {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Chladni Math Layer</p>
      <div className="mt-4 space-y-3 font-mono text-sm text-[var(--muted)]">
        <p>f(x,y) = cos(n*x)cos(m*y) - cos(m*x)cos(n*y)</p>
        <p>z(x,y) = sin(nπx/L)sin(mπy/L)</p>
        <p>z(x,y,t) = A * sin(nπx/L) * sin(mπy/L) * cos(ωt)</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        Solidity uses integer approximations derived from the same concepts: frequency weight, mode crossing complexity, node density, line thickness, symmetry bonus, and rarity multiplier.
      </p>
    </div>
  );
}
