"use client";

import { useMemo, useState } from "react";
import { formatEther } from "viem";
import { Minus, Plus, Sparkles } from "lucide-react";
import { useAccount, useChainId, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { ContractNodeArtwork } from "@/components/ContractNodeCard";
import { ContractStatus } from "@/components/ContractStatus";
import { SetupRequired } from "@/components/SetupRequired";
import { contracts, hasMintContract } from "@/lib/contracts";
import { requiredChainId } from "@/lib/chains";
import type { ChladniMetadata } from "@/types/node";

export function MintPanel() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const [quantity, setQuantity] = useState(1);
  const { writeContract, data: txHash, isPending: waitingForWallet, error: writeError } = useWriteContract();
  const { isLoading: pending, isSuccess: confirmed, isError: failed } = useWaitForTransactionReceipt({ hash: txHash });

  const reads = useReadContracts({
    contracts: hasMintContract
      ? [
          { ...contracts.resonanceGenesis, functionName: "totalSupply" },
          { ...contracts.resonanceGenesis, functionName: "maxSupply" },
          { ...contracts.resonanceGenesis, functionName: "mintPrice" }
        ]
      : []
  });

  const [totalSupply, maxSupply, mintPrice] = reads.data?.map((result) => result.result as bigint | undefined) || [];
  const wrongNetwork = isConnected && chainId !== requiredChainId;
  const previewMetadata = useMemo<ChladniMetadata>(
    () => ({
      name: "Preview Mode Chladni Node",
      description: "Local visual preview shown before Sepolia contracts and IPFS metadata are configured.",
      image: "",
      attributes: [
        { trait_type: "Frequency", value: "963 Hz" },
        { trait_type: "Mode", value: "6x8" },
        { trait_type: "Rarity Tier", value: "Preview Mode" }
      ]
    }),
    []
  );

  if (!hasMintContract) {
    return (
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="glass-panel overflow-hidden rounded-3xl p-3">
          <ContractNodeArtwork metadata={previewMetadata} tokenId={1n} large />
          <p className="p-4 text-sm text-[var(--warning)]">Preview Mode. Configure Sepolia contract addresses to enable real minting.</p>
        </article>
        <SetupRequired />
      </div>
    );
  }

  function mint() {
    if (!contracts.resonanceGenesis.address || !mintPrice) return;
    writeContract({
      ...contracts.resonanceGenesis,
      address: contracts.resonanceGenesis.address,
      functionName: "mint",
      args: [BigInt(quantity)],
      value: mintPrice * BigInt(quantity)
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="glass-panel overflow-hidden rounded-3xl p-3">
        <ContractNodeArtwork metadata={previewMetadata} tokenId={(totalSupply || 0n) + 1n} large />
      </article>
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <ContractStatus wrongNetwork={wrongNetwork} />
        <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)]">Sepolia Mint Console</p>
        <h1 className="mt-4 font-display text-4xl font-black uppercase text-[var(--text)]">Mint Chladni Node</h1>
        <p className="mt-4 text-[var(--muted)]">
          This page reads `totalSupply`, `maxSupply`, and `mintPrice` from the deployed Sepolia ERC721 and calls the real `mint(uint256)` function.
        </p>
        <div className="my-6 grid gap-3 sm:grid-cols-3">
          <Metric label="Price" value={mintPrice ? `${formatEther(mintPrice)} ETH` : "Loading"} />
          <Metric label="Supply" value={`${totalSupply ?? "?"} / ${maxSupply ?? "?"}`} />
          <Metric label="Network" value="Sepolia" />
        </div>
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[var(--panel-border)] bg-white/5 p-3">
          <span className="font-display text-xs uppercase tracking-[0.22em] text-[var(--muted)]">Quantity</span>
          <div className="flex items-center gap-3">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--panel-border)]" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-xl font-black">{quantity}</span>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--panel-border)]" onClick={() => setQuantity((value) => Math.min(5, value + 1))} aria-label="Increase quantity">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        {isConnected ? (
          <button type="button" disabled={wrongNetwork || waitingForWallet || pending} onClick={mint} className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-50 theme-button">
            <Sparkles className="h-5 w-5" /> Mint {quantity} Node{quantity > 1 ? "s" : ""}
          </button>
        ) : (
          <div className="rounded-2xl border border-[var(--panel-border)] bg-white/5 p-4">
            <p className="mb-3 text-sm text-[var(--muted)]">Connect a wallet on Sepolia to mint from the deployed contract.</p>
            <ConnectWalletButton />
          </div>
        )}
        <p className="mt-5 rounded-2xl border border-[var(--panel-border)] bg-black/20 p-4 text-sm text-[var(--muted)]">
          {waitingForWallet && "Waiting for wallet signature..."}
          {pending && "Transaction pending on Sepolia..."}
          {confirmed && `Confirmed. Transaction: ${txHash}`}
          {failed && "Transaction failed or was reverted."}
          {writeError && `Error: ${writeError.message}`}
          {!waitingForWallet && !pending && !confirmed && !failed && !writeError && "Ready. Minted token metadata resolves through tokenURI to Filebase/IPFS."}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--panel-border)] bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}
