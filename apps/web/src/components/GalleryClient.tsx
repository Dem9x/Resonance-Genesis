"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ContractNodeCard } from "@/components/ContractNodeCard";
import { SetupRequired } from "@/components/SetupRequired";
import { contracts, hasContractSetup, hasMintContract } from "@/lib/contracts";
import { fetchIpfsJson } from "@/lib/ipfs";
import type { ChladniMetadata } from "@/types/node";

export function GalleryClient() {
  const { address, isConnected } = useAccount();
  const [metadataById, setMetadataById] = useState<Record<string, ChladniMetadata>>({});
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const balanceRead = useReadContracts({
    contracts: hasMintContract && address ? [{ ...contracts.resonanceGenesis, functionName: "balanceOf", args: [address] }] : [],
    query: { enabled: hasMintContract && Boolean(address) }
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

  const tokenIdReads = useReadContracts({
    contracts: hasMintContract && address ? indexReads : [],
    query: { enabled: hasMintContract && Boolean(address) && balance > 0n }
  });

  const tokenIds = useMemo(
    () => tokenIdReads.data?.map((result) => result.result as bigint).filter(Boolean) || [],
    [tokenIdReads.data]
  );

  const tokenUriReads = useReadContracts({
    contracts: tokenIds.map((tokenId) => ({ ...contracts.resonanceGenesis, functionName: "tokenURI", args: [tokenId] })),
    query: { enabled: tokenIds.length > 0 }
  });

  const minerReads = useReadContracts({
    contracts: tokenIds.flatMap((tokenId) => [
      { ...contracts.miner, functionName: "hashrateOf", args: [tokenId] },
      { ...contracts.miner, functionName: "pendingEnergy", args: [tokenId] },
      { ...contracts.miner, functionName: "isStaked", args: [tokenId] }
    ]),
    query: { enabled: hasContractSetup && tokenIds.length > 0 }
  });

  useEffect(() => {
    let cancelled = false;
    async function loadMetadata() {
      setMetadataError(null);
      const entries = await Promise.all(
        (tokenUriReads.data || []).map(async (result, index) => {
          const tokenUri = result.result as string | undefined;
          if (!tokenUri) return null;
          const metadata = await fetchIpfsJson<ChladniMetadata>(tokenUri);
          return [tokenIds[index].toString(), metadata] as const;
        })
      );
      if (!cancelled) {
        setMetadataById(Object.fromEntries(entries.filter(Boolean) as [string, ChladniMetadata][]));
      }
    }
    if (tokenUriReads.data?.length) {
      loadMetadata().catch((error: Error) => !cancelled && setMetadataError(error.message));
    }
    return () => {
      cancelled = true;
    };
  }, [tokenIds, tokenUriReads.data]);

  if (!hasMintContract) return <SetupRequired title="Gallery requires the Sepolia NFT contract" />;

  if (!isConnected) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center">
        <p className="font-display text-2xl font-black uppercase text-[var(--text)]">Connect wallet to load your Chladni Nodes</p>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">The gallery reads `balanceOf`, `tokenOfOwnerByIndex`, and `tokenURI` directly from the Sepolia ERC721 contract.</p>
        <div className="mt-6 flex justify-center">
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

  if (balanceRead.isLoading || tokenIdReads.isLoading) {
    return <div className="glass-panel rounded-3xl p-10 text-center text-[var(--muted)]">Scanning wallet ownership on Sepolia...</div>;
  }

  if (balance === 0n) {
    return <div className="glass-panel rounded-3xl p-10 text-center text-[var(--muted)]">No Chladni Nodes found in this wallet.</div>;
  }

  return (
    <div className="space-y-5">
      {metadataError ? <div className="rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-[var(--danger)]">IPFS metadata error: {metadataError}</div> : null}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {tokenIds.map((tokenId, index) => (
          <ContractNodeCard
            key={tokenId.toString()}
            tokenId={tokenId}
            metadata={metadataById[tokenId.toString()]}
            hashrate={minerReads.data?.[index * 3]?.result as bigint | undefined}
            pendingEnergy={minerReads.data?.[index * 3 + 1]?.result as bigint | undefined}
            isStaked={minerReads.data?.[index * 3 + 2]?.result as boolean | undefined}
          />
        ))}
      </div>
    </div>
  );
}
