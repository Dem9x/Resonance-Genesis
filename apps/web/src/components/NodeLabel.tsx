import type { ChladniNode } from "@/types/node";

const rarityStyles: Record<ChladniNode["rarityTier"], string> = {
  Common: "border-slate-400/30 text-slate-200",
  Uncommon: "border-archive-mint/40 text-archive-mint",
  Rare: "border-archive-cyan/40 text-archive-cyan",
  Epic: "border-archive-violet/50 text-archive-violet",
  Legendary: "border-archive-ember/50 text-archive-ember",
  Mythic: "border-fuchsia-300/50 text-fuchsia-200"
};

export function NodeLabel({ node }: { node: ChladniNode }) {
  return (
    <div className="rounded-b-2xl border-t border-white/10 bg-archive-black/78 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <span className="shrink-0 whitespace-nowrap rounded-full border border-[var(--panel-border)] bg-[var(--accent)]/10 px-3 py-1 font-display text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          {node.frequency} Hz
        </span>
        <div className="min-w-0 text-center">
          <p className="font-display text-xs font-black uppercase tracking-[0.26em] text-[var(--text)]">Chladni Node</p>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">
            {node.patternFamily} / M{node.modeM}:N{node.modeN} / {node.backgroundGradient}
          </p>
        </div>
        <span className={`shrink-0 whitespace-nowrap rounded-full border bg-white/5 px-3 py-1 text-[0.66rem] font-bold ${rarityStyles[node.rarityTier]}`}>
          {node.isStaked ? node.miningStatus : node.rarityTier}
        </span>
      </div>
    </div>
  );
}
