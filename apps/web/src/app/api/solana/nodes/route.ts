import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json({
    owner: searchParams.get("owner"),
    nodes: [],
    note: "Solana node indexing cache is optional. Program accounts and SPL token accounts remain the source of truth."
  });
}
