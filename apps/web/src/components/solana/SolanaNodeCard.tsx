import type { SolanaNode } from "@/solana/types";

export function SolanaNodeCard({ node }: { node: SolanaNode }) {
  return (
    <article className="glass-panel overflow-hidden rounded-[1.5rem]">
      <div className="aspect-square bg-gradient-to-br from-[var(--bg-soft)] via-[var(--accent)]/20 to-[var(--accent-2)]/20">
        {node.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.image} alt={node.name || node.mint} className="h-full w-full object-cover" />
        ) : (
          <div className="relative h-full w-full">
            <div className="absolute inset-0 sand-field opacity-40" />
            <div className="node-art absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-display text-xs font-black uppercase tracking-[0.22em] text-[var(--accent)]">Solana Chladni Node</p>
        <h3 className="mt-2 truncate text-lg font-black text-[var(--text)]">{node.name || `${node.mint.slice(0, 6)}...${node.mint.slice(-4)}`}</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">{node.stake?.active ? "Staked / Mining" : "Owned / Idle"}</p>
      </div>
    </article>
  );
}
