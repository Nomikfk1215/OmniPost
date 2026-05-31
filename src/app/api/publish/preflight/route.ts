import { NextResponse } from "next/server";
import { z } from "zod";
import { listPublishCapabilities } from "@/lib/publish/capabilities";
import { PLATFORMS } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const preflightSchema = z.object({
  platforms: z.array(z.enum(PLATFORMS)).optional()
});

export async function POST(request: Request) {
  const payload = preflightSchema.safeParse(
    await request.json().catch(() => ({}))
  );

  if (!payload.success) {
    return NextResponse.json({ error: "发布预检参数不完整" }, { status: 400 });
  }

  const requestedPlatforms = new Set(payload.data.platforms ?? PLATFORMS);
  const capabilities = (await listPublishCapabilities()).filter((capability) =>
    requestedPlatforms.has(capability.platform)
  );

  return NextResponse.json({
    ok: capabilities.every(
      (capability) =>
        capability.realReady || capability.assistSupported || capability.preferredMode === "mock"
    ),
    capabilities
  });
}
