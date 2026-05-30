import { NextResponse } from "next/server";
import { z } from "zod";
import { getContentById } from "@/lib/db/contents";
import { upsertManyPlatformContents } from "@/lib/db/platform-contents";
import { generatePlatformContents, LLMGenerationError } from "@/lib/llm/generate";
import { PLATFORMS } from "@/types";

const generateSchema = z.object({
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  stylePreset: z.enum(["casual", "professional"])
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const content = await getContentById(params.id);

  if (!content) {
    return NextResponse.json({ error: "未找到原始内容" }, { status: 404 });
  }

  const payload = generateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "生成参数不完整" }, { status: 400 });
  }

  try {
    const outputs = await generatePlatformContents({
      content,
      platforms: payload.data.platforms,
      stylePreset: payload.data.stylePreset
    });
    const saved = await upsertManyPlatformContents(outputs);

    return NextResponse.json({ outputs: saved });
  } catch (error) {
    if (error instanceof LLMGenerationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Platform generation failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "平台适配失败" },
      { status: 500 }
    );
  }
}
