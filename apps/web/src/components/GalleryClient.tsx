"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ContractNodeCard } from "@/components/ContractNodeCard";
import { GalleryTabs, type GalleryTab } from "@/components/GalleryTabs";
import { RpcRateLimitNotice } from "@/components/RpcRateLimitNotice";
import { SetupRequired } from "@/components/SetupRequired";
import { contracts, hasContractSetup, hasMintContract, hasMinerContract } from "@/lib/contracts";
import { fetchMetadataBatch } from "@/lib/metadata";
import { energyQueryOptions, rpcQueryOptions } from "@/lib/query";
import type { ChladniMetadata } from "@/types/node";
import { useAccount, useReadContract, useReadContracts } from "wagmi";

export function GalleryClient() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<GalleryTab>("all");
  const [metadataById, setMetadataById] = useState<Record<string, ChladniMetadata>>({});
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const balanceRead = useReadContracts({
    contracts: hasMintContract && address ? [{ ...contracts.resonanceGenesis, functionName: "balanceOf", args: [address] }] : [],
    query: { ...rpcQueryOptions, enabled: hasMintContract && Boolean(address) }
  });

  const balance = (balanceRead.data?.[0]?.result as bigint | undefined) || 0n;
  const indexReads = useMemo(
    () =>
      Array.from({ length: Number(balance) }, (_, index) => ({
        ...contracts.resonanceGenesis,
        functionName: "tokenOfOwnerByIndex",
        args: [address, BigInt(index)]
      })),
    [address, balance]
  );

  const ownedReads = useReadContracts({
    contracts: hasMintContract && address ? indexReads : [],
    query: { ...rpcQueryOptions, enabled: hasMintContract && Boolean(address) && balance > 0n }
  });

  const stakedRead = useReadContract({
    ...contracts.miner,
    functionName: "getStakedTokens",
    args: [address],
    query: { ...rpcQueryOptions, enabled: hasMinerContract && Boolean(address) }
  });

  const ownedTokenIds = useMemo(() => ownedReads.data?.map((result) => result.result as bigint).filter(Boolean) || [], [ownedReads.data]);
  const stakedTokenIds = useMemo(() => ((stakedRead.data as readonly bigint[] | undefined) || []) as bigint[], [stakedRead.data]);
  const allTokenIds = useMemo(
    () => Array.from(new Set([...ownedTokenIds.map(String), ...stakedTokenIds.map(String)])).map(BigInt),
    [ownedTokenIds, stakedTokenIds]
  );

  const visibleTokenIds = useMemo(() => {
    if (activeTab === "owned") return ownedTokenIds;
    if (activeTab === "staked") return stakedTokenIds;
    return allTokenIds;
  }, [activeTab, allTokenIds, ownedTokenIds, stakedTokenIds]);

  const minerReads = useReadContracts({
    contracts: allTokenIds.flatMap((tokenId) => [
      { ...contracts.miner, functionName: "hashrateOf", args: [tokenId] },
      { ...contracts.miner, functionName: "pendingEnergy", args: [tokenId] },
      { ...contracts.miner, functionName: "isStaked", args: [tokenId] }
    ]),
    query: { ...energyQueryOptions, enabled: hasContractSetup && allTokenIds.length > 0 }
  });

  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      setMetadataError(null);
      const metadata = await fetchMetadataBatch(allTokenIds);
      if (!cancelled) setMetadataById(metadata);
    }
    if (allTokenIds.length) {
      loadMetadata().catch((error: Error) => !cancelled && setMetadataError(error.message));
    } else {
      setMetadataById({});
    }
    return () => {
      cancelled = true;
    };
  }, [allTokenIds]);

  if (!hasMintContract) return <SetupRequired title="Gallery requires the Sepolia NFT contract" />;

  if (!isConnected) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center">
        <p className="font-display text-2xl font-black uppercase text-[var(--text)]">Connect wallet to load your Chladni Nodes</p>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">The gallery reads owned ERC721 tokens and active staked miners from Sepolia.</p>
        <div className="mt-6 flex justify-center">
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

  if (balanceRead.isLoading || ownedReads.isLoading || stakedRead.isLoading) {
    return <div className="glass-panel rounded-3xl p-10 text-center text-[var(--muted)]">Scanning wallet ownership and staked miner state on Sepolia...</div>;
  }

  const counts = { all: allTokenIds.length, owned: ownedTokenIds.length, staked: stakedTokenIds.length };
  const trulyEmpty = allTokenIds.length === 0;
  const stakedOnly = ownedTokenIds.length === 0 && stakedTokenIds.length > 0;

  if (trulyEmpty) {
    return <div className="glass-panel rounded-3xl p-10 text-center text-[var(--muted)]">No owned or staked Chladni Nodes found for this wallet.</div>;
  }

  return (
    <div className="space-y-6">
      {metadataError ? <div className="rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-[var(--danger)]">IPFS metadata error: {metadataError}</div> : null}
      <RpcRateLimitNotice error={balanceRead.error || ownedReads.error || stakedRead.error || minerReads.error} />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[var(--accent)]">Wallet Resonance Archive</p>
          {stakedOnly ? <p className="mt-2 text-sm text-[var(--muted)]">Your active Chladni Nodes are currently staked and mining.</p> : null}
        </div>
        <GalleryTabs active={activeTab} counts={counts} onChange={setActiveTab} />
      </div>

      {visibleTokenIds.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleTokenIds.map((tokenId) => {
            const index = allTokenIds.findIndex((id) => id.toString() === tokenId.toString());
            return (
              <ContractNodeCard
                key={tokenId.toString()}
                tokenId={tokenId}
                metadata={metadataById[tokenId.toString()]}
                hashrate={minerReads.data?.[index * 3]?.result as bigint | undefined}
                pendingEnergy={minerReads.data?.[index * 3 + 1]?.result as bigint | undefined}
                isStaked={minerReads.data?.[index * 3 + 2]?.result as boolean | undefined}
              />
            );
          })}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-10 text-center text-[var(--muted)]">No nodes in this filter.</div>
      )}
    </div>
  );
}
