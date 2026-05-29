"use client";

import { useAccount } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { EnergyMeter } from "@/components/EnergyMeter";
import { MiningConsole } from "@/components/MiningConsole";
import { StakeMinerCard } from "@/components/StakeMinerCard";
import { mockNodes } from "@/data/mockNodes";

export function StakeDashboard() {
  const { address, isConnected } = useAccount();
  const ownedNodes = mockNodes.slice(0, 9);
  const stakedNodes = ownedNodes.filter((node) => node.isStaked);
  const totalEnergy = ownedNodes.reduce((sum, node) => sum + node.resonanceEnergy, 0);
  const dailyEmission = stakedNodes.reduce((sum, node) => sum + node.energyPerDay, 0);

  if (!isConnected) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center">
        <p className="font-display text-2xl font-black uppercase text-white">Connect wallet to activate miner console</p>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">The dashboard uses mock ownership data until wallet reads from the NFT and staking contracts are configured.</p>
        <div className="mt-6 flex justify-center">
          <ConnectWalletButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-4">
        <Summary label="Connected Wallet" value={`${address?.slice(0, 6)}...${address?.slice(-4)}`} />
        <Summary label="Owned Chladni Nodes" value={String(ownedNodes.length)} />
        <Summary label="Staked Chladni Nodes" value={String(stakedNodes.length)} />
        <Summary label="Daily Energy Emission" value={`${dailyEmission} RE`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-archive-cyan">Owned Miner Grid</p>
            <p className="text-sm text-slate-400">Mock wallet inventory</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {ownedNodes.map((node) => (
              <StakeMinerCard key={node.tokenId} node={node} />
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <MiningConsole />
          <EnergyMeter value={totalEnergy} max={8000} />
          <div className="glass-panel rounded-2xl p-5">
            <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-archive-cyan">Energy System</p>
            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <Row label="Balance" value={`${totalEnergy.toLocaleString()} RE`} />
              <Row label="Energy Rate" value={`${dailyEmission} RE/day`} />
              <Row label="Next Claim Estimate" value="~6 hours" />
              <Row label="Future Utility" value="Upgrades / cosmetics / future mints" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="font-display text-[0.62rem] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-3 break-words text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
      <span>{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
