import { defineChain } from "viem";
import { sepolia } from "wagmi/chains";

const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || sepolia.id);
const configuredRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

export const customResonanceChain = defineChain({
  id: configuredChainId,
  name: configuredChainId === sepolia.id ? "Sepolia" : "Resonance Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [configuredRpcUrl || sepolia.rpcUrls.default.http[0]]
    }
  },
  blockExplorers: configuredChainId === sepolia.id ? sepolia.blockExplorers : undefined,
  testnet: configuredChainId === sepolia.id
});

export const supportedChains = [customResonanceChain] as const;
export const requiredChainId = configuredChainId;
