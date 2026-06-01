"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getREStats } from "@/solana/reToken";

export function useREBalance() {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState({ configured: false, totalSupply: 0, maxSupply: 1_000_000_000, remainingSupply: 1_000_000_000, balance: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getREStats(publicKey || undefined)
      .then((nextStats) => !cancelled && setStats(nextStats))
      .finally(() => !cancelled && setLoading(false));
    const interval = window.setInterval(() => {
      getREStats(publicKey || undefined).then((nextStats) => !cancelled && setStats(nextStats));
    }, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [publicKey]);

  return { ...stats, loading };
}
