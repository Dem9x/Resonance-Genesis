import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ mint: string }> }) {
  const { mint } = await params;
  return NextResponse.json({
    mint,
    metadata: null,
    traits: null,
    note: "Cache placeholder. Read NodeTraits PDA directly from Solana for source-of-truth data."
  });
}
