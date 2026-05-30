import { NextResponse } from "next/server";
import { z } from "zod";
import { createMockPublishTask } from "@/lib/db/publish-tasks";
import { imageAssetSchema, platformImagePlanSchema } from "@/lib/images/schemas";
import { PLATFORMS } from "@/types";

const validationResultSchema = z.object({
  passed: z.boolean(),
  level: z.enum(["pass", "warning", "error"]),
  warnings: z.array(z.string()),
  checks: z.array(
    z.object({
      id: z.string(),
      level: z.enum(["pass", "warning", "error"]),
      message: z.string()
    })
  )
});

const platformContentSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  platform: z.enum(PLATFORMS),
  title: z.string(),
  body: z.string(),
  summary: z.string().optional(),
  digest: z.string().optional(),
  description: z.string().optional(),
  openingConclusion: z.string().optional(),
  html: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageSuggestions: z.array(z.string()).optional(),
  imageAssets: z.array(imageAssetSchema).optional(),
  imagePlan: z.array(platformImagePlanSchema).optional(),
  coverSuggestion: z.string().optional(),
  interactionGuide: z.string().optional(),
  categorySuggestion: z.string().optional(),
  validation: validationResultSchema,
  createdAt: z.string(),
  updatedAt: z.string()
});

const mockPublishSchema = z.object({
  contentId: z.string(),
  title: z.string().min(1),
  platformContents: z.array(platformContentSchema).min(1)
});

export async function POST(request: Request) {
  const payload = mockPublishSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "模拟发布参数不完整" }, { status: 400 });
  }

  const task = await createMockPublishTask(payload.data);
  return NextResponse.json({ task });
}
