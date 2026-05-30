import { NextResponse } from "next/server";
import { z } from "zod";
import { updatePlatformAccount } from "@/lib/db/platform-accounts";
import { PLATFORMS, type Platform } from "@/types";

export const runtime = "nodejs";

const updateAccountSchema = z
  .object({
    authorized: z.boolean().optional(),
    publishCapability: z.enum(["real", "mock", "assist"]).optional()
  })
  .refine(
    (payload) => payload.authorized !== undefined || payload.publishCapability !== undefined,
    "请提供要更新的账号字段"
  );

function isPlatform(value: string): value is Platform {
  return PLATFORMS.includes(value as Platform);
}

export async function PUT(
  request: Request,
  { params }: { params: { platform: string } }
) {
  if (!isPlatform(params.platform)) {
    return NextResponse.json({ error: "未知平台" }, { status: 404 });
  }

  const payload = updateAccountSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "账号参数不完整" },
      { status: 400 }
    );
  }

  const account = await updatePlatformAccount(params.platform, payload.data);
  return NextResponse.json({ account });
}
