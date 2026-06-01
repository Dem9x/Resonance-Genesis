"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fallback, http } from "viem";
import { sepoliaRpcUrls, supportedChains } from "@/lib/chains";

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

export const wagmiConfig = getDefaultConfig({
  appName: "Resonance Genesis",
  projectId: walletConnectProjectId,
  chains: supportedChains,
  transports: {
    [supportedChains[0].id]: fallback(sepoliaRpcUrls.map((url) => http(url)), {
      rank: true,
      retryCount: 1
    })
  },
  ssr: true
});
