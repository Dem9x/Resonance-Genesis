"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { scanSolanaNodes } from "@/solana/nodeScanner";
import { useSolanaProgram } from "@/solana/useSolanaProgram";
import type { SolanaNode } from "@/solana/types";

export function useChladniNodes() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program } = useSolanaProgram();
  const [nodes, setNodes] = useState<SolanaNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicKey || !program) {
        setNodes([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const nextNodes = await scanSolanaNodes({ connection, program, owner: publicKey });
        if (!cancelled) setNodes(nextNodes);
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Failed to load Solana nodes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = window.setInterval(load, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [connection, program, publicKey]);

  const ownedNodes = useMemo(() => nodes.filter((node) => !node.stake?.active), [nodes]);
  const stakedNodes = useMemo(() => nodes.filter((node) => node.stake?.active), [nodes]);

  return {
    owner: publicKey?.toBase58(),
    nodes,
    ownedNodes,
    stakedNodes,
    loading,
    error,
    refresh: async () => {
      if (!publicKey || !program) return;
      setNodes(await scanSolanaNodes({ connection, program, owner: publicKey }));
    }
  };
}
