const stats = [
  ["Network", "Sepolia"],
  ["Mint Contract", "Env"],
  ["Miner Contract", "Env"],
  ["Metadata", "IPFS"]
];

export function StatsBar() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="glass-panel rounded-2xl p-4">
          <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-2xl font-black text-[var(--text)]">{value}</p>
        </div>
      ))}
    </div>
  );
}
