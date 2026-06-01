"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { SolanaNode } from "@/solana/types";

export function useChladniNodes() {
  const { publicKey } = useWallet();
  const nodes = useMemo<SolanaNode[]>(() => [], []);
  return {
    owner: publicKey?.toBase58(),
    nodes,
    ownedNodes: nodes.filter((node) => !node.stake?.active),
    stakedNodes: nodes.filter((node) => node.stake?.active),
    loading: false
  };
}
