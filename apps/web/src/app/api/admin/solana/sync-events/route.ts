import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ queued: true, note: "Solana event sync hook accepted. Implement indexer worker for production." });
}

function isAdmin(request: Request) {
  const expected = process.env.ADMIN_API_KEY;
  return Boolean(expected && request.headers.get("x-admin-api-key") === expected);
}
