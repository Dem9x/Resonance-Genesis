"use client";

import { useEffect, useState } from "react";
import { Pickaxe, RotateCcw, Zap } from "lucide-react";
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { EnergyMeter } from "@/components/EnergyMeter";
import { FormulaPanel } from "@/components/FormulaPanel";
import { HashrateMeter } from "@/components/HashrateMeter";
import { SetupRequired } from "@/components/SetupRequired";
import { TraitGrid } from "@/components/TraitGrid";
import { contracts, hasContractSetup } from "@/lib/contracts";
import { fetchIpfsJson } from "@/lib/ipfs";
import { rarityName } from "@/lib/hashrate";
import type { ChladniMetadata } from "@/types/node";

export function NodeDetailClient({ tokenId }: { tokenId: bigint }) {
  const { address, isConnected } = useAccount();
  const [metadata, setMetadata] = useState<ChladniMetadata | undefined>();
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const { writeContract, data: hash, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const reads = useReadContracts({
    contracts: hasContractSetup
      ? [
          { ...contracts.resonanceGenesis, functionName: "tokenURI", args: [tokenId] },
          { ...contracts.resonanceGenesis, functionName: "ownerOf", args: [tokenId] },
          { ...contracts.resonanceGenesis, functionName: "getNodeTraits", args: [tokenId] },
          { ...contracts.miner, functionName: "isStaked", args: [tokenId] },
          { ...contracts.miner, functionName: "stakedOwner", args: [tokenId] },
          { ...contracts.miner, functionName: "hashrateOf", args: [tokenId] },
          { ...contracts.miner, functionName: "pendingEnergy", args: [tokenId] }
        ]
      : []
  });

  const tokenUri = reads.data?.[0]?.result as string | undefined;
  const owner = reads.data?.[1]?.result as `0x${string}` | undefined;
  const traits = reads.data?.[2]?.result as readonly [number, number, number, number, number, number] | undefined;
  const isStaked = reads.data?.[3]?.result as boolean | undefined;
  const stakedOwner = reads.data?.[4]?.result as `0x${string}` | undefined;
  const hashrate = reads.data?.[5]?.result as bigint | undefined;
  const pendingEnergy = reads.data?.[6]?.result as bigint | undefined;
  const canOperate = isConnected && (owner?.toLowerCase() === address?.toLowerCase() || stakedOwner?.toLowerCase() === address?.toLowerCase());

  useEffect(() => {
    let cancelled = false;
    if (!tokenUri) return;
    fetchIpfsJson<ChladniMetadata>(tokenUri)
      .then((data) => !cancelled && setMetadata(data))
      .catch((error: Error) => !cancelled && setMetadataError(error.message));
    return () => {
      cancelled = true;
    };
  }, [tokenUri]);

  if (!hasContractSetup) return <SetupRequired title="Node detail requires Sepolia contracts" />;

  function stake() {
    if (!contracts.miner.address) return;
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "stake", args: [tokenId] });
  }

  function unstake() {
    if (!contracts.miner.address) return;
    writeContract({ ...contracts.miner, address: contracts.miner.address, functionName: "unstake", args: [tokenId] });
  }

  function claim() {
    if (!contracts.miner.address) return;
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
        </div>
        <TraitGrid
          traits={[
            ["Owner", owner || "Unknown"],
            ["Staked Owner", stakedOwner || "None"],
            ["Frequency", traits ? `${traits[0]} Hz` : "Unset"],
            ["Mode", traits ? `M${traits[2]}:N${traits[1]}` : "Unset"],
            ["Node Density", traits ? `${traits[3]} bps` : "Unset"],
            ["Line Thickness", traits ? `${traits[4]} bps` : "Unset"],
            ["Rarity Tier", traits ? rarityName(Number(traits[5])) : "Unset"],
            ["Mining Status", isStaked ? "Mining" : "Idle"]
          ]}
        />
        <HashrateMeter value={hashrate} />
        <EnergyMeter value={Number(pendingEnergy || 0n)} max={10000} label="Pending Resonance Energy" />
        <FormulaPanel />
        <div className="glass-panel rounded-3xl p-5">
          {isConnected ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={stake} disabled={!canOperate || isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold disabled:opacity-50 theme-button">
                <Pickaxe className="h-4 w-4" /> Stake Node
              </button>
              <button type="button" onClick={unstake} disabled={!canOperate || !isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-bold disabled:opacity-50 theme-button-secondary">
                <RotateCcw className="h-4 w-4" /> Unstake Node
              </button>
              <button type="button" onClick={claim} disabled={!canOperate || !isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--warning)]/35 bg-[var(--warning)]/10 px-4 py-3 font-bold text-[var(--warning)] disabled:opacity-50">
                <Zap className="h-4 w-4" /> Claim Energy
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[var(--muted)]">Connect wallet to stake, unstake, or claim energy if eligible.</p>
              <ConnectWalletButton />
            </div>
          )}
          {receipt.isSuccess ? <p className="mt-4 text-sm text-[var(--success)]">Transaction confirmed.</p> : null}
        </div>
      </div>
    </div>
  );
}
