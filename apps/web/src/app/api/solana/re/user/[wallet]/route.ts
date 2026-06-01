import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params;
  const mint = process.env.RE_MINT_ADDRESS || process.env.NEXT_PUBLIC_RE_MINT_ADDRESS;
  if (!mint) return NextResponse.json({ configured: false, balance: 0 });

  const connection = new Connection(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
  const ata = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(wallet));
  const balance = await connection.getTokenAccountBalance(ata).catch(() => undefined);

  return NextResponse.json({
    configured: true,
    wallet,
    reMint: mint,
    tokenAccount: ata.toBase58(),
    balance: Number(balance?.value.uiAmount || 0)
  });
}
