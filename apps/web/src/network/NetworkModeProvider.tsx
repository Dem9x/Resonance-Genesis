"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type NetworkMode = "solana" | "evm";

type NetworkModeContextValue = {
  mode: NetworkMode;
  setMode: (mode: NetworkMode) => void;
};

const storageKey = "resonance-genesis-network-mode";
const NetworkModeContext = createContext<NetworkModeContextValue | null>(null);

function modeFromPathname(pathname: string): NetworkMode | null {
  if (pathname.startsWith("/solana")) return "solana";
  if (["/", "/mint", "/gallery", "/stake"].includes(pathname)) return "evm";
  if (pathname.startsWith("/node/")) return "evm";
  return null;
}

function readStoredMode(): NetworkMode | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(storageKey);
  return stored === "solana" || stored === "evm" ? stored : null;
}

export function NetworkModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mode, setModeState] = useState<NetworkMode>(() => modeFromPathname(pathname) || "solana");

  useEffect(() => {
    const routeMode = modeFromPathname(pathname);
    const storedMode = readStoredMode();
    setModeState(routeMode || storedMode || "solana");
  }, [pathname]);

  const value = useMemo<NetworkModeContextValue>(
    () => ({
      mode,
      setMode(nextMode) {
        window.localStorage.setItem(storageKey, nextMode);
        setModeState(nextMode);
      },
    }),
    [mode],
  );

  return <NetworkModeContext.Provider value={value}>{children}</NetworkModeContext.Provider>;
}

export function useNetworkMode() {
  const value = useContext(NetworkModeContext);
  if (!value) throw new Error("useNetworkMode must be used inside NetworkModeProvider");
  return value;
}

export function networkModeForPath(pathname: string) {
  return modeFromPathname(pathname);
}
