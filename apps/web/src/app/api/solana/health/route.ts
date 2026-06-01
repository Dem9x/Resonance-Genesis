import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

export async function GET() {
  const rpcUrl = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const connection = new Connection(rpcUrl, "confirmed");
  const version = await connection.getVersion().catch(() => undefined);

  return NextResponse.json({
    network: process.env.SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    rpcUrl,
    programId: process.env.RESONANCE_SOLANA_PROGRAM_ID || process.env.NEXT_PUBLIC_RESONANCE_SOLANA_PROGRAM_ID || "",
    reMint: process.env.RE_MINT_ADDRESS || process.env.NEXT_PUBLIC_RE_MINT_ADDRESS || "",
    healthy: Boolean(version),
    version
  });
}
