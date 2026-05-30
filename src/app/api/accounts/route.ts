import { NextResponse } from "next/server";
import { listPlatformAccounts } from "@/lib/db/platform-accounts";
import { enrichOAuthStatus } from "@/lib/platform-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const accounts = (await listPlatformAccounts()).map(enrichOAuthStatus);
  return NextResponse.json({ accounts });
}
