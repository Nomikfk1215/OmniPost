import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAllPublicCredentials,
  getPublicCredential,
  saveCredential,
  deleteCredential,
  CREDENTIAL_FIELDS
} from "@/lib/db/platform-credentials";
import { PLATFORMS } from "@/types";

export const runtime = "nodejs";

const saveSchema = z.object({
  platform: z.enum(PLATFORMS),
  credentials: z.record(z.string(), z.string().optional())
});

/** 获取所有平台凭据（或单个平台） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (platform) {
    const parsed = z.enum(PLATFORMS).safeParse(platform);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "平台参数不正确" },
        { status: 400 }
      );
    }

    const fields = CREDENTIAL_FIELDS[parsed.data];
    if (fields.length === 0) {
      return NextResponse.json(
        { error: `平台 ${platform} 暂不支持凭据配置` },
        { status: 400 }
      );
    }

    return NextResponse.json(await getPublicCredential(parsed.data));
  }

  return NextResponse.json(await getAllPublicCredentials());
}

/** 保存平台凭据 */
export async function PUT(request: Request) {
  const payload = saveSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      {
        error: payload.error.issues[0]?.message ?? "配置参数不完整"
      },
      { status: 400 }
    );
  }

  const { platform, credentials } = payload.data;
  const fields = CREDENTIAL_FIELDS[platform];

  if (fields.length === 0) {
    return NextResponse.json(
      { error: `平台 ${platform} 暂不支持凭据配置` },
      { status: 400 }
    );
  }

  try {
    await saveCredential(platform, credentials);
    return NextResponse.json(await getPublicCredential(platform));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "保存失败"
      },
      { status: 500 }
    );
  }
}

/** 删除平台凭据 */
export async function DELETE(request: Request) {
  const { platform } = (await request.json().catch(() => ({}))) as {
    platform?: string;
  };
  const parsed = z.enum(PLATFORMS).safeParse(platform);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "平台参数不正确" },
      { status: 400 }
    );
  }

  try {
    await deleteCredential(parsed.data);
    return NextResponse.json(await getPublicCredential(parsed.data));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "删除失败"
      },
      { status: 500 }
    );
  }
}
