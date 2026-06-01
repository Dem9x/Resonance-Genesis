"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Wallet, Cpu, Gauge, RadioTower, Zap } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { EnergySummaryCard } from "@/components/EnergySummaryCard";
import { FeaturedMinerCard } from "@/components/FeaturedMinerCard";
import { MinerGrid } from "@/components/MinerGrid";
import type { MinerCardNode } from "@/components/MinerGridCard";
import { MiningConsole } from "@/components/MiningConsole";
import { ResonanceWaveChart } from "@/components/ResonanceWaveChart";
import { RpcRateLimitNotice } from "@/components/RpcRateLimitNotice";
import { SetupRequired } from "@/components/SetupRequired";
import { contracts, hasContractSetup, hasMintContract, hasMinerContract, hasResonanceEnergyContract, chladniNodeMinerAddress } from "@/lib/contracts";
import { fetchMetadataBatch } from "@/lib/metadata";
import { energyQueryOptions, rpcQueryOptions } from "@/lib/query";
import { normalizeNodeTraits } from "@/lib/traits";
import type { ChladniMetadata } from "@/types/node";

export function StakePanel() {
  const { address, isConnected } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | undefined>();
  const [metadataById, setMetadataById] = useState<Record<string, ChladniMetadata>>({});
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const balanceRead = useReadContracts({
    contracts: hasMintContract && address ? [{ ...contracts.resonanceGenesis, functionName: "balanceOf", args: [address] }] : [],
    query: { ...rpcQueryOptions, enabled: hasMintContract && Boolean(address) }
  });

  const balance = (balanceRead.data?.[0]?.result as bigint | undefined) || 0n;
  const ownedIndexReads = useMemo(
    () =>
      Array.from({ length: Number(balance) }, (_, index) => ({
        ...contracts.resonanceGenesis,
        functionName: "tokenOfOwnerByIndex",
        args: [address, BigInt(index)]
      })),
    [address, balance]
  );

  const ownedReads = useReadContracts({
    contracts: hasMintContract && address ? ownedIndexReads : [],
    query: { ...rpcQueryOptions, enabled: hasMintContract && Boolean(address) && balance > 0n }
  });

  const stakedRead = useReadContract({
    ...contracts.miner,
    functionName: "getStakedTokens",
    args: [address],
    query: { ...rpcQueryOptions, enabled: hasMinerContract && Boolean(address) }
  });

  const reReads = useReadContracts({
    contracts: hasResonanceEnergyContract && address
      ? [
          { ...contracts.resonanceEnergy, functionName: "totalSupply" },
          { ...contracts.resonanceEnergy, functionName: "maxSupply" },
          { ...contracts.resonanceEnergy, functionName: "remainingSupply" },
          { ...contracts.resonanceEnergy, functionName: "balanceOf", args: [address] }
        ]
      : [],
    query: { ...rpcQueryOptions, enabled: hasResonanceEnergyContract && Boolean(address) }
  });

  const ownedTokenIds = useMemo(() => ownedReads.data?.map((result) => result.result as bigint).filter(Boolean) || [], [ownedReads.data]);
  const stakedTokenIds = useMemo(() => ((stakedRead.data as readonly bigint[] | undefined) || []) as bigint[], [stakedRead.data]);
  const allTokenIds = useMemo(
    () => Array.from(new Set([...ownedTokenIds.map(String), ...stakedTokenIds.map(String)])).map(BigInt),
    [ownedTokenIds, stakedTokenIds]
  );

  const minerReads = useReadContracts({
    contracts: allTokenIds.flatMap((tokenId) => [
      { ...contracts.miner, functionName: "isStaked", args: [tokenId] },
      { ...contracts.miner, functionName: "hashrateOf", args: [tokenId] },
      { ...contracts.miner, functionName: "pendingEnergy", args: [tokenId] },
      { ...contracts.resonanceGenesis, functionName: "getApproved", args: [tokenId] },
      { ...contracts.resonanceGenesis, functionName: "getNodeTraits", args: [tokenId] }
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

  const nodes: MinerCardNode[] = useMemo(
    () =>
      allTokenIds.map((tokenId, index) => {
        const offset = index * 5;
        const approved = minerReads.data?.[offset + 3]?.result as `0x${string}` | undefined;
        return {
          tokenId,
          metadata: metadataById[tokenId.toString()],
          isStaked: minerReads.data?.[offset]?.result as boolean | undefined,
          hashrate: minerReads.data?.[offset + 1]?.result as bigint | undefined,
          pendingEnergy: minerReads.data?.[offset + 2]?.result as bigint | undefined,
          isApproved: approved?.toLowerCase() === chladniNodeMinerAddress?.toLowerCase(),
          traits: normalizeNodeTraits(minerReads.data?.[offset + 4]?.result)
        };
      }),
    [allTokenIds, metadataById, minerReads.data]
  );

  useEffect(() => {
    if (!nodes.length) {
      setSelectedTokenId(undefined);
      return;
    }
    if (!selectedTokenId || !nodes.some((node) => node.tokenId.toString() === selectedTokenId.toString())) {
      setSelectedTokenId(nodes[0].tokenId);
    }
  }, [nodes, selectedTokenId]);

  const selectedNode = nodes.find((node) => node.tokenId.toString() === selectedTokenId?.toString()) || nodes[0];
  const totalPending = nodes.reduce((total, node) => total + (node.pendingEnergy || 0n), 0n);
  const totalHashrate = nodes.reduce((total, node) => total + (node.isStaked ? node.hashrate || 0n : 0n), 0n);
  const dailyEmission = nodes.reduce((total, node) => total + (node.isStaked ? Number(node.hashrate || 0n) : 0), 0);
  const reTotalSupply = reReads.data?.[0]?.result as bigint | undefined;
  const reMaxSupply = reReads.data?.[1]?.result as bigint | undefined;
  const reRemainingSupply = reReads.data?.[2]?.result as bigint | undefined;
  const reBalance = reReads.data?.[3]?.result as bigint | undefined;
  const isLoading = balanceRead.isLoading || ownedReads.isLoading || stakedRead.isLoading || minerReads.isLoading || reReads.isLoading;

  function refetchMinerState() {
    void balanceRead.refetch();
    void ownedReads.refetch();
    void stakedRead.refetch();
    void minerReads.refetch();
    void reReads.refetch();
  }

  if (!hasContractSetup) return <SetupRequired title="Staking requires NFT, miner, and RE contract addresses" />;
  if (!isConnected) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center">
        <p className="font-display text-2xl font-black uppercase text-[var(--text)]">Connect wallet to activate miner console</p>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">The miner dashboard reads wallet-owned NFTs plus staked tokens from `ChladniNodeMiner` on Sepolia.</p>
        <div className="mt-6 flex justify-center">
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.34em] text-[var(--accent)]">Sepolia Miner Terminal</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black uppercase tracking-wide text-[var(--text)] md:text-5xl">Stake the Pattern. Mine the Resonance.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
            RE is native resonance power. Stake a Chladni Node to activate mining mode and accumulate RE over time. RE is a utility power balance, not a financial return.
          </p>
        </div>
        <div className="rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--success)] shadow-[0_0_24px_var(--glow)]">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--success)]" />
          Contract Live
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Summary icon={<Wallet className="h-4 w-4" />} label="Connected Wallet" value={`${address?.slice(0, 6)}...${address?.slice(-4)}`} />
        <Summary icon={<Cpu className="h-4 w-4" />} label="Owned Nodes" value={<AnimatedNumber value={ownedTokenIds.length} />} />
        <Summary icon={<RadioTower className="h-4 w-4" />} label="Staked Miners" value={<AnimatedNumber value={stakedTokenIds.length} />} />
        <Summary icon={<Gauge className="h-4 w-4" />} label="Native Power" value="RE Power" />
        <Summary icon={<Zap className="h-4 w-4" />} label="Wallet RE Balance" value={formatRe(reBalance)} wide />
        <Summary icon={<ActivityIcon />} label="Estimated RE / day" value={<AnimatedNumber value={dailyEmission} suffix=" RE" />} wide />
      </div>

      {metadataError ? <div className="rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-[var(--danger)]">IPFS metadata error: {metadataError}</div> : null}
      <RpcRateLimitNotice error={balanceRead.error || ownedReads.error || stakedRead.error || minerReads.error || reReads.error} />
      {isLoading ? <div className="glass-panel rounded-3xl p-6 text-center text-[var(--muted)]">Synchronizing miner state from Sepolia...</div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
        <div className="space-y-6">
          <FeaturedMinerCard node={selectedNode} onConfirmed={refetchMinerState} />
          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Owned + Staked Miner Grid</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Click a node to route it into the featured miner panel.</p>
              </div>
              <p className="hidden text-xs uppercase tracking-[0.18em] text-[var(--muted)] md:block">Sepolia contract state</p>
            </div>
            <MinerGrid nodes={nodes} selectedTokenId={selectedNode?.tokenId} onSelect={setSelectedTokenId} />
          </section>
        </div>
        <aside className="space-y-5">
          <MiningConsole logs={consoleLogs(selectedNode)} />
          <EnergySummaryCard totalPending={totalPending} totalHashrate={totalHashrate} dailyEmission={dailyEmission} />
          <RESupplyPanel totalSupply={reTotalSupply} maxSupply={reMaxSupply} remainingSupply={reRemainingSupply} balance={reBalance} />
          <ResonanceWaveChart frequency={selectedNode?.traits?.frequency} />
          <div className="glass-panel rounded-[1.75rem] p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Energy System</p>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              RE is derived from hashrate and elapsed time while a Chladni Node is staked. Formula hint: RE = Hashrate x Active Time / Energy Scale.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Summary({ icon, label, value, wide = false }: { icon: ReactNode; label: string; value: ReactNode; wide?: boolean }) {
  return (
    <div className={`glass-panel rounded-[1.35rem] p-5 ${wide ? "xl:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 text-[var(--accent)]">
        {icon}
        <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      </div>
      <p className="mt-3 break-words text-2xl font-black text-[var(--text)]">{value}</p>
    </div>
  );
}

function RESupplyPanel({
  totalSupply,
  maxSupply,
  remainingSupply,
  balance
}: {
  totalSupply?: bigint;
  maxSupply?: bigint;
  remainingSupply?: bigint;
  balance?: bigint;
}) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5">
      <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">RE ERC20 Supply</p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        RE is a capped ERC20 token minted only by the ChladniNodeMiner contract when users claim mined RE.
      </p>
      <div className="mt-5 grid gap-3">
        <SupplyMetric label="User Balance" value={formatRe(balance)} />
        <SupplyMetric label="Total Supply" value={formatRe(totalSupply)} />
        <SupplyMetric label="Max Supply" value={formatRe(maxSupply)} />
        <SupplyMetric label="Remaining Supply" value={formatRe(remainingSupply)} />
      </div>
    </div>
  );
}

function SupplyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--panel-border)] bg-[var(--bg)]/55 p-3">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{label}</span>
      <span className="text-right text-sm font-black text-[var(--text)]">{value}</span>
    </div>
  );
}

function consoleLogs(node?: MinerCardNode) {
  if (!node) return ["wallet scan initialized", "waiting for Chladni Node selection", "miner console standing by"];
  return [
    `NODE #${node.tokenId.toString()} selected`,
    node.isStaked ? "staked owner lock confirmed" : "wallet custody confirmed",
    node.isApproved || node.isStaked ? "miner approval route clear" : "approval required before staking",
    `hashrate channel ${Number(node.hashrate || 0n).toLocaleString()} H/s`,
    node.isStaked ? "resonance energy accumulating" : "activation cycle ready"
  ];
}

function ActivityIcon() {
  return <span className="h-4 w-4 rounded-full border border-[var(--accent)] bg-[var(--accent)]/20 shadow-[0_0_16px_var(--glow)]" />;
}

function formatRe(value?: bigint) {
  if (value === undefined) return "Loading";
  const formatted = Number(formatUnits(value, 18)).toLocaleString(undefined, {
    maximumFractionDigits: 4
  });
  return `${formatted} RE`;
}
