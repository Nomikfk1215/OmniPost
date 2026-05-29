import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlatformContentById, upsertPlatformContent } from "@/lib/db/platform-contents";

const updatePlatformContentSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
  summary: z.string().optional(),
  digest: z.string().optional(),
  description: z.string().optional(),
  openingConclusion: z.string().optional(),
  html: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageSuggestions: z.array(z.string()).optional(),
  coverSuggestion: z.string().optional(),
  interactionGuide: z.string().optional(),
  categorySuggestion: z.string().optional()
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const content = await getPlatformContentById(params.id);

  if (!content) {
    return NextResponse.json({ error: "未找到平台内容" }, { status: 404 });
  }

  return NextResponse.json({ content });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const existing = await getPlatformContentById(params.id);

  if (!existing) {
    return NextResponse.json({ error: "未找到平台内容" }, { status: 404 });
  }

  const payload = updatePlatformContentSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "更新字段不合法" }, { status: 400 });
  }

  const updated = await upsertPlatformContent({
    ...existing,
    ...payload.data,
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json({ content: updated });
}
