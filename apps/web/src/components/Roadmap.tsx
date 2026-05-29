const phases = [
  "Resonance Genesis Mint",
  "Chladni Node Staking",
  "Resonance Energy System",
  "Node Upgrades",
  "Animated Node Miner Mode"
];

export function Roadmap() {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      {phases.map((phase, index) => (
        <div key={phase} className="glass-panel rounded-2xl p-5">
          <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.24em] text-archive-cyan">Phase {index + 1}</p>
          <p className="text-lg font-bold text-white">{phase}</p>
        </div>
      ))}
    </div>
  );
}
