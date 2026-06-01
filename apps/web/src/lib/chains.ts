import { defineChain } from "viem";
import { sepolia } from "wagmi/chains";

const configuredChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || sepolia.id);
const configuredRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
const alchemyRpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL;
const infuraRpcUrl = process.env.NEXT_PUBLIC_INFURA_SEPOLIA_RPC_URL;

export const sepoliaRpcUrls = Array.from(
  new Set(
    [
      configuredRpcUrl,
      alchemyRpcUrl,
      infuraRpcUrl,
      "https://ethereum-sepolia-rpc.publicnode.com",
      sepolia.rpcUrls.default.http[0]
    ].filter(Boolean) as string[]
  )
);

export const customResonanceChain = defineChain({
  id: configuredChainId,
  name: configuredChainId === sepolia.id ? "Sepolia" : "Resonance Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: sepoliaRpcUrls
    }
  },
  blockExplorers: configuredChainId === sepolia.id ? sepolia.blockExplorers : undefined,
  testnet: configuredChainId === sepolia.id
});

export const supportedChains = [customResonanceChain] as const;
export const requiredChainId = configuredChainId;
