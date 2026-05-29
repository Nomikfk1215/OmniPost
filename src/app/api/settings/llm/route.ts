import { NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteLLMSettings,
  getPublicLLMSettings,
  saveLLMSettings
} from "@/lib/llm/settings-store";

export const runtime = "nodejs";

const settingsSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().trim().min(1, "请填写 API 地址").url("API 地址格式不正确"),
  model: z.string().trim().min(1, "请填写模型名称"),
  enabled: z.boolean()
});

export async function GET() {
  return NextResponse.json(await getPublicLLMSettings());
}

export async function PUT(request: Request) {
  const payload = settingsSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "配置参数不完整" },
      { status: 400 }
    );
  }

  await saveLLMSettings(payload.data);
  return NextResponse.json(await getPublicLLMSettings());
}

export async function DELETE() {
  await deleteLLMSettings();
  return NextResponse.json(await getPublicLLMSettings());
}

