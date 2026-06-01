"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Pickaxe, RotateCcw, Zap } from "lucide-react";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { EnergyMeter } from "@/components/EnergyMeter";
import { FormulaPanel } from "@/components/FormulaPanel";
import { HashrateMeter } from "@/components/HashrateMeter";
import { SetupRequired } from "@/components/SetupRequired";
import { TraitGrid } from "@/components/TraitGrid";
import { RpcRateLimitNotice } from "@/components/RpcRateLimitNotice";
import { chladniNodeMinerAddress, contracts, hasContractSetup } from "@/lib/contracts";
import { rarityName } from "@/lib/hashrate";
import { fetchMetadataBatch } from "@/lib/metadata";
import { energyQueryOptions } from "@/lib/query";
import type { ChladniMetadata } from "@/types/node";

export function NodeDetailClient({ tokenId }: { tokenId: bigint }) {
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<ChladniMetadata | undefined>();
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<"approve" | "stake" | "unstake" | "claim" | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const reads = useReadContracts({
        contracts: hasContractSetup
      ? [
          { ...contracts.resonanceGenesis, functionName: "ownerOf", args: [tokenId] },
          { ...contracts.resonanceGenesis, functionName: "getNodeTraits", args: [tokenId] },
          { ...contracts.resonanceGenesis, functionName: "getApproved", args: [tokenId] },
          { ...contracts.miner, functionName: "isStaked", args: [tokenId] },
          { ...contracts.miner, functionName: "stakedOwner", args: [tokenId] },
          { ...contracts.miner, functionName: "hashrateOf", args: [tokenId] },
          { ...contracts.miner, functionName: "pendingEnergy", args: [tokenId] }
        ]
      : [],
    query: { ...energyQueryOptions, enabled: hasContractSetup }
  });

  const owner = reads.data?.[0]?.result as `0x${string}` | undefined;
  const traits = normalizeTraits(reads.data?.[1]?.result);
  const approvedAddress = reads.data?.[2]?.result as `0x${string}` | undefined;
  const isStaked = reads.data?.[3]?.result as boolean | undefined;
  const stakedOwner = reads.data?.[4]?.result as `0x${string}` | undefined;
  const hashrate = reads.data?.[5]?.result as bigint | undefined;
  const pendingEnergy = reads.data?.[6]?.result as bigint | undefined;
  const isOwner = isConnected && owner?.toLowerCase() === address?.toLowerCase();
  const isStakedOwner = isConnected && stakedOwner?.toLowerCase() === address?.toLowerCase();
  const isApproved = Boolean(chladniNodeMinerAddress && approvedAddress?.toLowerCase() === chladniNodeMinerAddress.toLowerCase());
  const canOperate = Boolean(isOwner || isStakedOwner);

  useEffect(() => {
    if (receipt.isSuccess) {
      reads.refetch();
    }
  }, [reads, receipt.isSuccess]);

  useEffect(() => {
    let cancelled = false;
    fetchMetadataBatch([tokenId])
      .then((data) => !cancelled && setMetadata(data[tokenId.toString()]))
      .catch((error: Error) => !cancelled && setMetadataError(error.message));
    return () => {
      cancelled = true;
    };
  }, [tokenId]);

  if (!hasContractSetup) return <SetupRequired title="Node detail requires Sepolia contracts" />;

  function approve() {
    if (!contracts.resonanceGenesis.address || !chladniNodeMinerAddress) return;
    setLastAction("approve");
    writeContract({
      ...contracts.resonanceGenesis,
      address: contracts.resonanceGenesis.address,
      functionName: "approve",
      args: [chladniNodeMinerAddress, tokenId]
    });
  }

  function stake() {
    if (!contracts.miner.address) return;
    setLastAction("stake");
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "stake", args: [tokenId] });
  }

  function unstake() {
    if (!contracts.miner.address) return;
    setLastAction("unstake");
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "unstake", args: [tokenId] });
  }

  function claim() {
    if (!contracts.miner.address) return;
    setLastAction("claim");
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "claim", args: [tokenId] });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="glass-panel overflow-hidden rounded-3xl p-3">
        <ContractNodeArtwork metadata={metadata} tokenId={tokenId} large />
      </article>
      <div className="space-y-5">
        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Chladni Node #{tokenId.toString()}</p>
          <h1 className="mt-4 font-display text-4xl font-black uppercase text-[var(--text)]">{metadata?.name || "Loading token metadata"}</h1>
          <p className="mt-4 text-[var(--muted)]">{metadata?.description || "Reading tokenURI metadata from Filebase/IPFS through the configured gateway."}</p>
          {metadataError ? <p className="mt-4 text-sm text-[var(--danger)]">IPFS metadata error: {metadataError}</p> : null}
          <div className="mt-4">
            <RpcRateLimitNotice error={reads.error} />
          </div>
        </div>
        <TraitGrid
          traits={[
            ["Owner", owner || "Unknown"],
            ["Staked Owner", stakedOwner || "None"],
            ["Frequency", traits?.initialized ? `${traits.frequency} Hz` : "Unset"],
            ["Mode", traits?.initialized ? `M${traits.modeM}:N${traits.modeN}` : "Unset"],
            ["Node Density", traits?.initialized ? `${traits.nodeDensityBps} bps` : "Unset"],
            ["Line Thickness", traits?.initialized ? `${traits.lineThicknessBps} bps` : "Unset"],
            ["Rarity Tier", traits?.initialized ? rarityName(Number(traits.rarityTier)) : "Unset"],
            ["Mining Status", isStaked ? "Mining" : "Idle"]
          ]}
        />
        <HashrateMeter value={hashrate} />
        <EnergyMeter value={Number(pendingEnergy || 0n)} max={10000} label="Pending RE" hashrate={hashrate} isMining={isStaked} />
        <FormulaPanel />
        <div className="glass-panel rounded-3xl p-5">
          {isConnected ? (
            <div className="space-y-3">
              {isOwner && !isStaked && !isApproved ? (
                <div className="rounded-2xl border border-[var(--warning)]/35 bg-[var(--warning)]/10 p-4 text-sm text-[var(--warning)]">
                  Node ini belum approve ke miner contract. Approve dulu sebelum staking.
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                {isOwner && !isStaked && !isApproved ? (
                  <button type="button" onClick={approve} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold disabled:opacity-50 theme-button">
                    <CheckCircle className="h-4 w-4" /> Approve Miner
                  </button>
                ) : (
                  <button type="button" onClick={stake} disabled={!isOwner || !isApproved || isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold disabled:opacity-50 theme-button">
                    <Pickaxe className="h-4 w-4" /> Stake Node
                  </button>
                )}
              <button type="button" onClick={unstake} disabled={!canOperate || !isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold disabled:opacity-50 theme-button-secondary">
                <RotateCcw className="h-4 w-4" /> Unstake Node
              </button>
              <button type="button" onClick={claim} disabled={!canOperate || !isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--warning)]/35 bg-[var(--warning)]/10 px-4 py-3 font-bold text-[var(--warning)] disabled:opacity-50">
                <Zap className="h-4 w-4" /> Claim RE
              </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[var(--muted)]">Connect wallet to stake, unstake, or claim energy if eligible.</p>
              <ConnectWalletButton />
            </div>
          )}
          {receipt.isSuccess ? <p className="mt-4 text-sm text-[var(--success)]">{lastAction === "approve" ? "Approve confirmed. You can stake this node now." : "Transaction confirmed."}</p> : null}
        </div>
      </div>
    </div>
  );
}

type NormalizedTraits = {
  frequency: number;
  modeN: number;
  modeM: number;
  nodeDensityBps: number;
  lineThicknessBps: number;
  rarityTier: number;
  initialized: boolean;
};

function normalizeTraits(value: unknown): NormalizedTraits | undefined {
  if (!value) return undefined;

  if (Array.isArray(value)) {
    return {
      frequency: Number(value[0]),
      modeN: Number(value[1]),
      modeM: Number(value[2]),
      nodeDensityBps: Number(value[3]),
      lineThicknessBps: Number(value[4]),
      rarityTier: Number(value[5]),
      initialized: Boolean(value[6])
    };
  }

  const traits = value as Partial<Record<keyof NormalizedTraits, unknown>>;
  return {
    frequency: Number(traits.frequency),
    modeN: Number(traits.modeN),
    modeM: Number(traits.modeM),
    nodeDensityBps: Number(traits.nodeDensityBps),
    lineThicknessBps: Number(traits.lineThicknessBps),
    rarityTier: Number(traits.rarityTier),
    initialized: Boolean(traits.initialized)
  };
}
