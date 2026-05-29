const logs = [
  "NODE #12 activated",
  "frequency lock acquired",
  "sand field coherence stable",
  "resonance energy accumulated",
  "claim cycle ready"
];

export function MiningConsole() {
  return (
    <div className="glass-panel scanlines relative overflow-hidden rounded-2xl p-5">
      <div className="absolute inset-x-0 top-0 h-20 animate-scan bg-gradient-to-b from-transparent via-[var(--accent)]/10 to-transparent" />
      <div className="mb-5 flex items-center justify-between">
        <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Mining Console</p>
        <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_18px_var(--success)]" />
      </div>
      <div className="space-y-3 font-mono text-sm text-[var(--muted)]">
        {logs.map((log, index) => (
          <p key={log}>
            <span className="text-[var(--accent)]">[{String(index + 1).padStart(2, "0")}]</span> {log}
          </p>
        ))}
      </div>
    </div>
  );
}
