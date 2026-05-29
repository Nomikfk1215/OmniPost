import { NextResponse } from "next/server";
import { z } from "zod";
import { createContent } from "@/lib/db/contents";

const createContentSchema = z.object({
  title: z.string().optional(),
  rawText: z.string().min(1),
  images: z.array(z.string()).optional(),
  userTags: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const payload = createContentSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "内容正文不能为空" }, { status: 400 });
  }

  const content = await createContent(payload.data);
  return NextResponse.json({ content });
}
