"use client";

import { useState } from "react";
import { Pickaxe, Radio, Zap } from "lucide-react";
import type { ChladniNode } from "@/types/node";
import { NodeArtwork } from "@/components/ChladniNodeCard";

export function StakeMinerCard({ node }: { node: ChladniNode }) {
  const [isStaked, setIsStaked] = useState(node.isStaked);
  const [energy, setEnergy] = useState(node.resonanceEnergy);
  const progress = Math.min(100, Math.round((energy % 500) / 5));

  function claimEnergy() {
    // TODO: Replace mock state with stakingContract.claim(tokenId) once the deployed ABI/address is configured.
    setEnergy((current) => current + Math.round(node.energyPerDay / 2));
  }

  function toggleStake() {
    // TODO: Replace mock state with stakingContract.stake(tokenId) / unstake(tokenId).
    setIsStaked((current) => !current);
  }

  return (
    <article className="glass-panel overflow-hidden rounded-2xl">
      <NodeArtwork node={{ ...node, isStaked }} />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xs font-black uppercase tracking-[0.22em] text-white">Node #{node.tokenId}</p>
            <p className="mt-1 text-xs text-slate-400">{node.frequency} Hz / {node.patternFamily}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isStaked ? "border-archive-mint/40 text-archive-mint" : "border-slate-500/40 text-slate-300"}`}>
            {isStaked ? "Mining" : "Idle"}
          </span>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Emission cycle</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-archive-cyan to-archive-violet" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button type="button" onClick={toggleStake} className="inline-flex items-center justify-center gap-2 rounded-full border border-archive-cyan/30 bg-archive-cyan/10 px-3 py-2 font-bold text-archive-cyan hover:bg-archive-cyan/20">
            <Pickaxe className="h-4 w-4" />
            {isStaked ? "Unstake" : "Stake"}
          </button>
          <button type="button" onClick={claimEnergy} className="inline-flex items-center justify-center gap-2 rounded-full border border-archive-ember/30 bg-archive-ember/10 px-3 py-2 font-bold text-archive-ember hover:bg-archive-ember/20">
            <Zap className="h-4 w-4" />
            Claim
          </button>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2"><Radio className="h-4 w-4 text-archive-cyan" /> {node.energyPerDay} RE/day</span>
          <span>{energy.toLocaleString()} RE</span>
        </div>
      </div>
    </article>
  );
}
