import { z } from "zod";

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
