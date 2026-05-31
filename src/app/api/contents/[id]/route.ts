import { NextResponse } from "next/server";
import { z } from "zod";
import { getContentById, updateContent } from "@/lib/db/contents";
import { listPlatformContentsByContentId } from "@/lib/db/platform-contents";
import { imageInputSchema } from "@/lib/images/schemas";

const updateContentSchema = z.object({
  title: z.string().optional(),
  contentType: z.enum(["tutorial", "article", "note", "campaign"]).optional(),
  rawText: z.string().optional(),
  images: z.array(imageInputSchema).optional(),
  userTags: z.array(z.string()).optional()
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const content = await getContentById(params.id);

  if (!content) {
    return NextResponse.json({ error: "未找到原始内容" }, { status: 404 });
  }

  const platformContents = await listPlatformContentsByContentId(params.id);

  return NextResponse.json({ content, platformContents });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const payload = updateContentSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "内容更新字段不合法" }, { status: 400 });
  }

  const content = await updateContent(params.id, payload.data);

  if (!content) {
    return NextResponse.json({ error: "未找到原始内容" }, { status: 404 });
  }

  return NextResponse.json({ content });
}
