import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ mint: string }> }) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { mint } = await params;
  return NextResponse.json({ cached: false, mint, note: "Cache hook accepted. Wire MongoDB solanaNodeTraitsCache in the indexer worker." });
}

function isAdmin(request: Request) {
  const expected = process.env.ADMIN_API_KEY;
  return Boolean(expected && request.headers.get("x-admin-api-key") === expected);
}
