import { NextResponse } from "next/server";
import { z } from "zod";
import { submitPublish } from "@/lib/publish/submit";
import { imageAssetSchema, platformImagePlanSchema } from "@/lib/images/schemas";
import { PLATFORMS } from "@/types";

export const runtime = "nodejs";

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

const submitSchema = z.object({
  contentId: z.string(),
  title: z.string().min(1),
  mode: z.enum(["mock", "real"]).default("mock"),
  platformContents: z.array(platformContentSchema).min(1)
});

export async function POST(request: Request) {
  const payload = submitSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json(
      { error: payload.error.issues[0]?.message ?? "发布参数不完整" },
      { status: 400 }
    );
  }

  try {
    const task = await submitPublish(payload.data);
    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "发布失败"
      },
      { status: 500 }
    );
  }
}
