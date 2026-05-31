import { z } from "zod";
import type { Platform } from "@/types";

const optionalString = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().optional()
);

const optionalStringArray = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.array(z.string()).optional()
);

const defaultStringArray = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.array(z.string()).default([])
);

export const contentBriefSchema = z.object({
  sourceTitle: optionalString,
  coreTopic: z.string(),
  summary: z.string(),
  mainPoints: z.array(z.string()).min(1),
  retainedDetails: defaultStringArray,
  keywords: z.array(z.string()).min(1),
  audience: optionalString,
  tone: optionalString
});

export const wechatSchema = z.object({
  title: z.string(),
  digest: z.string(),
  html: z.string(),
  coverSuggestion: optionalString,
  imageSuggestions: optionalStringArray
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
  imageSuggestions: optionalStringArray,
  interactionGuide: optionalString
});

export const bilibiliSchema = z.object({
  title: z.string(),
  description: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
  categorySuggestion: z.string(),
  coverSuggestion: optionalString
});

export const platformOutputSchemas = {
  wechat: wechatSchema,
  zhihu: zhihuSchema,
  xiaohongshu: xiaohongshuSchema,
  bilibili: bilibiliSchema
} satisfies Record<Platform, z.ZodTypeAny>;

export type ContentBrief = z.infer<typeof contentBriefSchema>;
