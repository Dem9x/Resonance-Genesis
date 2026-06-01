import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

export async function GET() {
  const mint = process.env.RE_MINT_ADDRESS || process.env.NEXT_PUBLIC_RE_MINT_ADDRESS;
  if (!mint) {
    return NextResponse.json({ configured: false, totalSupply: 0, maxSupply: 1_000_000_000, remainingSupply: 1_000_000_000 });
  }

  const connection = new Connection(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
  const supply = await connection.getTokenSupply(new PublicKey(mint));
  const totalSupply = Number(supply.value.uiAmount || 0);
  return NextResponse.json({
    configured: true,
    mint,
    totalSupply,
    maxSupply: 1_000_000_000,
    remainingSupply: Math.max(0, 1_000_000_000 - totalSupply)
  });
}
