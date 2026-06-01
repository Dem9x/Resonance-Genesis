import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { solanaConnection } from "@/solana/connection";
import { optionalPublicKey, reMintAddress, maxReSupply } from "@/solana/constants";

export async function getREStats(owner?: PublicKey) {
  const mint = optionalPublicKey(reMintAddress);
  if (!mint) {
    return { configured: false, totalSupply: 0, maxSupply: maxReSupply, remainingSupply: maxReSupply, balance: 0 };
  }

  const supply = await solanaConnection.getTokenSupply(mint);
  let balance = 0;
  if (owner) {
    const ata = getAssociatedTokenAddressSync(mint, owner);
    const tokenBalance = await solanaConnection.getTokenAccountBalance(ata).catch(() => undefined);
    balance = Number(tokenBalance?.value.uiAmount || 0);
  }

  const totalSupply = Number(supply.value.uiAmount || 0);
  return {
    configured: true,
    totalSupply,
    maxSupply: maxReSupply,
    remainingSupply: Math.max(0, maxReSupply - totalSupply),
    balance
  };
}
