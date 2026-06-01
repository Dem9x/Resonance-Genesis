"use client";

import { MinerGridCard, type MinerCardNode } from "@/components/MinerGridCard";

export function MinerGrid({
  nodes,
  selectedTokenId,
  onSelect
}: {
  nodes: MinerCardNode[];
  selectedTokenId?: bigint;
  onSelect: (tokenId: bigint) => void;
}) {
  if (!nodes.length) {
    return <div className="glass-panel rounded-[1.5rem] p-8 text-center text-[var(--muted)]">No owned or staked Chladni Nodes found for this wallet.</div>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {nodes.map((node) => (
        <MinerGridCard
          key={node.tokenId.toString()}
          node={node}
          selected={selectedTokenId?.toString() === node.tokenId.toString()}
          onSelect={() => onSelect(node.tokenId)}
        />
      ))}
    </div>
  );
}
