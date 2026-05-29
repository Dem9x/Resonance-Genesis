export function TraitGrid({ traits }: { traits: [string, string | number][] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {traits.map(([label, value]) => (
        <div key={label} className="glass-panel rounded-2xl p-4">
          <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
          <p className="mt-2 break-words font-semibold text-[var(--text)]">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}
