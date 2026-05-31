import { NextResponse } from "next/server";
import { listPublishCapabilities } from "@/lib/publish/capabilities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const capabilities = await listPublishCapabilities();
  return NextResponse.json({ capabilities });
}
