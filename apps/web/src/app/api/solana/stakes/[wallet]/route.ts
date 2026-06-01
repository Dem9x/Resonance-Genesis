import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params;
  return NextResponse.json({
    wallet,
    stakes: [],
    note: "Stake event cache placeholder. Solana program stake PDAs remain the source of truth."
  });
}
