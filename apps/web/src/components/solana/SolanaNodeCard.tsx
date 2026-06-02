"use client";

import { useMemo, useState } from "react";
import type { SolanaNode } from "@/solana/types";

export function SolanaNodeCard({ node }: { node: SolanaNode }) {
  const rarityNames = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];
  const imageCandidates = useMemo(
    () => [...new Set([node.image, ...(node.imageFallbacks || [])].filter(Boolean) as string[])],
    [node.image, node.imageFallbacks],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const image = imageCandidates[imageIndex];

  return (
    <article className="glass-panel overflow-hidden rounded-[1.5rem]">
      <div className="aspect-square bg-gradient-to-br from-[var(--bg-soft)] via-[var(--accent)]/20 to-[var(--accent-2)]/20">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={node.name || node.mint}
            className="h-full w-full object-cover"
            onError={() => setImageIndex((current) => (current + 1 < imageCandidates.length ? current + 1 : current))}
          />
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
        <p className="mt-2 text-sm text-[var(--muted)]">
          {node.stake?.active ? "Staked / Mining" : "Owned / Idle"}
          {node.traitsSource === "metadata" ? " · metadata traits" : ""}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <Metric label="Frequency" value={node.traits?.frequency ? `${node.traits.frequency} Hz` : "Unset"} />
          <Metric label="Mode" value={node.traits ? `${node.traits.modeN}x${node.traits.modeM}` : "Unset"} />
          <Metric label="Rarity" value={node.traits ? rarityNames[node.traits.rarityTier] || "Common" : "Unset"} />
          <Metric label="Hashrate" value={node.hashrate ? `${node.hashrate} H/s` : "0 H/s"} />
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--panel-border)] bg-[var(--bg)]/50 p-2">
      <p className="uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}
