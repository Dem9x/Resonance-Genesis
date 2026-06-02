"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Cpu, Orbit } from "lucide-react";
import { useNetworkMode, type NetworkMode } from "@/network/NetworkModeProvider";

const modeLabels: Record<NetworkMode, string> = {
  solana: "Solana Devnet",
  evm: "EVM Sepolia",
};

function routeForMode(pathname: string, mode: NetworkMode) {
  const mapToSolana: Record<string, string> = {
    "/": "/solana",
    "/mint": "/solana/mint",
    "/gallery": "/solana/gallery",
    "/stake": "/solana/stake",
    "/docs": "/docs/solana",
  };
  const mapToEvm: Record<string, string> = {
    "/solana": "/",
    "/solana/mint": "/mint",
    "/solana/gallery": "/gallery",
    "/solana/stake": "/stake",
    "/docs/solana": "/docs",
  };

  if (mode === "solana") {
    if (pathname.startsWith("/node/")) return "/solana/gallery";
    return mapToSolana[pathname] || (pathname.startsWith("/solana") ? pathname : "/solana");
  }

  if (pathname.startsWith("/solana/node/")) return "/gallery";
  return mapToEvm[pathname] || (pathname.startsWith("/solana") ? "/" : pathname);
}

export function NetworkModeSwitcher() {
  const { mode, setMode } = useNetworkMode();
  const pathname = usePathname();
  const router = useRouter();
  const Icon = mode === "solana" ? Orbit : Cpu;
  const targetLabel = useMemo(() => modeLabels[mode], [mode]);

  function changeMode(nextMode: NetworkMode) {
    setMode(nextMode);
    router.push(routeForMode(pathname, nextMode));
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--muted)] shadow-[0_0_18px_var(--glow)]">
      <Icon className="h-4 w-4 text-[var(--accent)]" />
      <span className="sr-only">Network mode</span>
      <select
        value={mode}
        onChange={(event) => changeMode(event.target.value as NetworkMode)}
        className="max-w-[8.5rem] bg-transparent font-black uppercase tracking-[0.08em] outline-none"
        aria-label={`Network mode: ${targetLabel}`}
      >
        <option value="solana" className="bg-black text-white">
          Solana Devnet
        </option>
        <option value="evm" className="bg-black text-white">
          EVM Sepolia
        </option>
      </select>
    </label>
  );
}
