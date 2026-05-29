"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { CheckCircle, Pickaxe, RotateCcw, Zap } from "lucide-react";
import { useAccount, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { EnergyMeter } from "@/components/EnergyMeter";
import { HashrateMeter } from "@/components/HashrateMeter";
import { MiningConsole } from "@/components/MiningConsole";
import { SetupRequired } from "@/components/SetupRequired";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { contracts, hasContractSetup, hasMintContract, hasMinerContract, chladniNodeMinerAddress } from "@/lib/contracts";
import { rarityName } from "@/lib/hashrate";

export function StakePanel() {
  const { address, isConnected } = useAccount();

  const balanceRead = useReadContracts({
    contracts: hasMintContract && address ? [{ ...contracts.resonanceGenesis, functionName: "balanceOf", args: [address] }] : [],
    query: { enabled: hasMintContract && Boolean(address) }
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
    query: { enabled: hasMintContract && Boolean(address) && balance > 0n }
  });
  const stakedRead = useReadContract({
    ...contracts.miner,
    functionName: "getStakedTokens",
    args: [address],
    query: { enabled: hasMinerContract && Boolean(address) }
  });

  if (!hasContractSetup) return <SetupRequired title="Staking requires NFT and miner contract addresses" />;
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

  const ownedTokenIds = ownedReads.data?.map((result) => result.result as bigint).filter(Boolean) || [];
  const stakedTokenIds = (stakedRead.data as bigint[] | undefined) || [];
  const allTokenIds = Array.from(new Set([...ownedTokenIds.map(String), ...stakedTokenIds.map(String)])).map(BigInt);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-4">
        <Summary label="Connected Wallet" value={`${address?.slice(0, 6)}...${address?.slice(-4)}`} />
        <Summary label="Owned Nodes" value={String(ownedTokenIds.length)} />
        <Summary label="Staked Miners" value={String(stakedTokenIds.length)} />
        <Summary label="Energy Mode" value="Utility Points" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Owned + Staked Miner Grid</p>
            <p className="text-sm text-[var(--muted)]">Sepolia contract state</p>
          </div>
          {allTokenIds.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {allTokenIds.map((tokenId) => (
                <MinerActionCard key={tokenId.toString()} tokenId={tokenId} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-8 text-center text-[var(--muted)]">No owned or staked Chladni Nodes found.</div>
          )}
        </div>
        <aside className="space-y-5">
          <MiningConsole />
          <EnergyMeter value={0} max={1000} />
          <div className="glass-panel rounded-2xl p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">Energy System</p>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
              Resonance Energy is accumulated through deterministic hashrate and elapsed time. It is a utility point balance, not APY, yield, or financial return.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MinerActionCard({ tokenId }: { tokenId: bigint }) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const reads = useReadContracts({
    contracts: [
      { ...contracts.miner, functionName: "isStaked", args: [tokenId] },
      { ...contracts.miner, functionName: "hashrateOf", args: [tokenId] },
      { ...contracts.miner, functionName: "pendingEnergy", args: [tokenId] },
      { ...contracts.resonanceGenesis, functionName: "getApproved", args: [tokenId] },
      { ...contracts.resonanceGenesis, functionName: "getNodeTraits", args: [tokenId] }
    ],
    query: { enabled: Boolean(address) }
  });

  const isStaked = reads.data?.[0]?.result as boolean | undefined;
  const hashrate = reads.data?.[1]?.result as bigint | undefined;
  const pendingEnergy = reads.data?.[2]?.result as bigint | undefined;
  const approved = reads.data?.[3]?.result as `0x${string}` | undefined;
  const traits = reads.data?.[4]?.result as readonly [number, number, number, number, number, number] | undefined;
  const isApproved = approved?.toLowerCase() === chladniNodeMinerAddress?.toLowerCase();

  function approve() {
    if (!contracts.resonanceGenesis.address || !chladniNodeMinerAddress) return;
    writeContract({
      ...contracts.resonanceGenesis,
      address: contracts.resonanceGenesis.address,
      functionName: "approve",
      args: [chladniNodeMinerAddress, tokenId]
    });
  }

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
    <article className="glass-panel overflow-hidden rounded-2xl">
      <ContractNodeArtwork tokenId={tokenId} />
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-xs font-black uppercase tracking-[0.22em] text-[var(--text)]">Node #{tokenId.toString()}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {traits ? `${traits[0]} Hz / M${traits[2]}:N${traits[1]} / ${rarityName(Number(traits[5]))}` : "Trait read pending"}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${isStaked ? "border-[var(--success)]/40 text-[var(--success)]" : "border-[var(--panel-border)] text-[var(--muted)]"}`}>
            {isStaked ? "Mining" : "Idle"}
          </span>
        </div>
        <HashrateMeter value={hashrate} label="Hashrate" />
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Pending Resonance Energy</span>
          <span className="font-bold text-[var(--text)]">{formatUnits(pendingEnergy || 0n, 0)} RE</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {!isStaked && !isApproved ? (
            <button type="button" onClick={approve} disabled={isPending} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 font-bold theme-button-secondary">
              <CheckCircle className="h-4 w-4" /> Approve Miner
            </button>
          ) : null}
          {!isStaked ? (
            <button type="button" onClick={stake} disabled={!isApproved || isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 font-bold disabled:opacity-50 theme-button">
              <Pickaxe className="h-4 w-4" /> Stake
            </button>
          ) : (
            <button type="button" onClick={unstake} disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 font-bold theme-button-secondary">
              <RotateCcw className="h-4 w-4" /> Unstake
            </button>
          )}
          <button type="button" onClick={claim} disabled={!isStaked || isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-2 font-bold text-[var(--warning)] disabled:opacity-50">
            <Zap className="h-4 w-4" /> Claim
          </button>
        </div>
        {receipt.isSuccess ? <p className="text-xs text-[var(--success)]">Transaction confirmed.</p> : null}
      </div>
    </article>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 break-words text-2xl font-black text-[var(--text)]">{value}</p>
    </div>
  );
}
