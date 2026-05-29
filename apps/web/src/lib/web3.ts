"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { supportedChains } from "@/lib/chains";

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const wagmiConfig = getDefaultConfig({
  appName: "Resonance Genesis",
  projectId: walletConnectProjectId,
  chains: supportedChains,
  ssr: true
});
