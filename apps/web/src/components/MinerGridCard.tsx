"use client";

import { Activity, RadioTower, Zap } from "lucide-react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { EstimatedEnergyNumber } from "@/components/EstimatedEnergyNumber";
import { rarityName } from "@/lib/hashrate";
import type { ChladniMetadata, NodeTraits } from "@/types/node";

export type MinerCardNode = {
  tokenId: bigint;
  metadata?: ChladniMetadata;
  traits?: NodeTraits;
  isStaked?: boolean;
  isApproved?: boolean;
  hashrate?: bigint;
  pendingEnergy?: bigint;
};

export function MinerGridCard({ node, selected, onSelect }: { node: MinerCardNode; selected: boolean; onSelect: () => void }) {
  const status = node.isStaked ? "Mining" : node.isApproved ? "Ready" : "Idle";

  return (
    <button type="button" onClick={onSelect} className="group block text-left">
      <article
        className={`glass-panel h-full overflow-hidden rounded-[1.35rem] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/60 ${
          selected ? "border-[var(--accent)]/70 shadow-[0_0_42px_var(--glow)]" : ""
        }`}
      >
        <div className="relative">
          <ContractNodeArtwork tokenId={node.tokenId} metadata={node.metadata} />
          <span className="absolute right-3 top-3 rounded-full border border-[var(--panel-border)] bg-[var(--bg)]/75 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--accent-2)] backdrop-blur">
            {status}
          </span>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-sm font-black uppercase tracking-[0.2em] text-[var(--text)]">Node #{node.tokenId.toString()}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {node.traits ? `${node.traits.frequency} Hz / ${node.traits.modeN}x${node.traits.modeM}` : "Traits syncing"}
              </p>
            </div>
            <span className="rounded-full border border-[var(--panel-border)] bg-white/5 px-2.5 py-1 text-[0.65rem] font-bold text-[var(--accent)]">
              {node.traits ? rarityName(node.traits.rarityTier) : "NODE"}
            </span>
          </div>
          <AnimatedProgressBar value={node.pendingEnergy} max={10000} />
          <div className="grid grid-cols-2 gap-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--accent)]" />
              <AnimatedNumber value={node.hashrate} suffix=" H/s" />
            </span>
            <span className="flex items-center justify-end gap-2">
              <Zap className="h-4 w-4 text-[var(--warning)]" />
              <EstimatedEnergyNumber baseEnergy={node.pendingEnergy} hashrate={node.hashrate} isMining={node.isStaked} />
            </span>
          </div>
          <div className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--muted)]">
            <RadioTower className="h-3.5 w-3.5 text-[var(--accent-2)]" />
            Sepolia miner signal
          </div>
        </div>
      </article>
    </button>
  );
}
