"use client";

import { useEffect } from "react";
import { CheckCircle, Pickaxe, RotateCcw, Zap } from "lucide-react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AnimatedProgressBar } from "@/components/AnimatedProgressBar";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { EstimatedEnergyNumber } from "@/components/EstimatedEnergyNumber";
import { HashrateMeter } from "@/components/HashrateMeter";
import type { MinerCardNode } from "@/components/MinerGridCard";
import { contracts, chladniNodeMinerAddress } from "@/lib/contracts";
import { rarityName } from "@/lib/hashrate";

export function FeaturedMinerCard({ node, onConfirmed }: { node?: MinerCardNode; onConfirmed?: () => void }) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (receipt.isSuccess) onConfirmed?.();
  }, [onConfirmed, receipt.isSuccess]);

  if (!node) {
    return (
      <div className="glass-panel rounded-[2rem] p-10 text-center text-[var(--muted)]">
        Select a Chladni Node to inspect miner state, hashrate, and available actions.
      </div>
    );
  }

  const activeNode = node;
  const status = activeNode.isStaked ? "Mining" : activeNode.isApproved ? "Ready To Stake" : "Approval Required";
  const traits = activeNode.traits;

  function approve() {
    if (!contracts.resonanceGenesis.address || !chladniNodeMinerAddress) return;
    writeContract({
      ...contracts.resonanceGenesis,
      address: contracts.resonanceGenesis.address,
      functionName: "approve",
      args: [chladniNodeMinerAddress, activeNode.tokenId]
    });
  }

  function stake() {
    if (!contracts.miner.address) return;
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "stake", args: [activeNode.tokenId] });
  }

  function unstake() {
    if (!contracts.miner.address) return;
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "unstake", args: [activeNode.tokenId] });
  }

  function claim() {
    if (!contracts.miner.address) return;
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "claim", args: [activeNode.tokenId] });
  }

  return (
    <article className="glass-panel overflow-hidden rounded-[2rem]">
      <div className="grid gap-0 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[440px] border-b border-[var(--panel-border)] xl:border-b-0 xl:border-r">
          <ContractNodeArtwork tokenId={activeNode.tokenId} metadata={activeNode.metadata} large />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/80 p-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-[0.65rem] font-black uppercase tracking-[0.26em] text-[var(--accent)]">Featured Miner</p>
                <p className="mt-1 text-2xl font-black text-[var(--text)]">Node #{activeNode.tokenId.toString()}</p>
              </div>
              <span className="rounded-full border border-[var(--panel-border)] bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--accent-2)]">
                {status}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6 xl:p-7">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Chladni Node Miner</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-wide text-[var(--text)]">{activeNode.metadata?.name || `Chladni Node #${activeNode.tokenId}`}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Activated nodes accumulate RE through deterministic on-chain cymatics traits. RE is native resonance power, not a financial return.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Frequency" value={traits ? `${traits.frequency} Hz` : "Syncing"} />
            <Metric label="Mode" value={traits ? `${traits.modeN}x${traits.modeM}` : "Syncing"} />
            <Metric label="Pattern Family" value={attribute(activeNode.metadata, "Pattern Family") || "On-chain trait"} />
            <Metric label="Rarity" value={traits ? rarityName(traits.rarityTier) : "Syncing"} />
            <Metric label="Mining Status" value={activeNode.isStaked ? "Mining" : "Idle"} />
            <Metric label="Node Density" value={traits ? `${traits.nodeDensityBps} bps` : "Syncing"} />
          </div>

          <HashrateMeter value={activeNode.hashrate} label="Live Hashrate" />

          <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/45 p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">Pending RE</p>
              <p className="text-lg font-black text-[var(--accent)]">
                <EstimatedEnergyNumber baseEnergy={activeNode.pendingEnergy} hashrate={activeNode.hashrate} isMining={activeNode.isStaked} />
              </p>
            </div>
            <AnimatedProgressBar value={activeNode.pendingEnergy} max={10000} />
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {!activeNode.isStaked && !activeNode.isApproved ? (
              <button type="button" onClick={approve} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black theme-button-secondary disabled:opacity-50">
                <CheckCircle className="h-4 w-4" /> Approve
              </button>
            ) : null}
            <button type="button" onClick={stake} disabled={Boolean(activeNode.isStaked) || !activeNode.isApproved || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black theme-button disabled:opacity-45">
              <Pickaxe className="h-4 w-4" /> Stake
            </button>
            <button type="button" onClick={unstake} disabled={!activeNode.isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black theme-button-secondary disabled:opacity-45">
              <RotateCcw className="h-4 w-4" /> Unstake
            </button>
            <button type="button" onClick={claim} disabled={!activeNode.isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm font-black text-[var(--warning)] disabled:opacity-45">
              <Zap className="h-4 w-4" /> Claim RE
            </button>
          </div>

          {receipt.isSuccess ? <p className="text-sm font-bold text-[var(--success)]">Transaction confirmed. Miner state is refreshing.</p> : null}
          {error ? <p className="text-sm font-bold text-[var(--danger)]">{error.message}</p> : null}
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/45 p-4">
      <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 break-words text-sm font-black text-[var(--text)]">{value}</p>
    </div>
  );
}

function attribute(metadata: MinerCardNode["metadata"], trait: string) {
  return metadata?.attributes?.find((item) => item.trait_type === trait)?.value?.toString();
}
