import { z } from "zod";
import type { Platform } from "@/types";

export const contentBriefSchema = z.object({
  sourceTitle: z.string().optional(),
  coreTopic: z.string(),
  summary: z.string(),
  mainPoints: z.array(z.string()).min(1),
  retainedDetails: z.array(z.string()).default([]),
  keywords: z.array(z.string()).min(1),
  audience: z.string().optional(),
  tone: z.string().optional()
});

export const wechatSchema = z.object({
  title: z.string(),
  digest: z.string(),
  html: z.string(),
  coverSuggestion: z.string().optional(),
  imageSuggestions: z.array(z.string()).optional()
});

export const zhihuSchema = z.object({
  title: z.string(),
  openingConclusion: z.string(),
  body: z.string(),
  tags: z.array(z.string())
});

export const xiaohongshuSchema = z.object({
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  imageSuggestions: z.array(z.string()).optional(),
  interactionGuide: z.string().optional()
});

export const bilibiliSchema = z.object({
  title: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  categorySuggestion: z.string(),
  coverSuggestion: z.string().optional()
});

export const platformOutputSchemas = {
  wechat: wechatSchema,
  zhihu: zhihuSchema,
  xiaohongshu: xiaohongshuSchema,
  bilibili: bilibiliSchema
} satisfies Record<Platform, z.ZodTypeAny>;

export type ContentBrief = z.infer<typeof contentBriefSchema>;
