import { z } from "zod";

export const imageAssetSchema = z.object({
  id: z.string(),
  source: z.enum(["upload", "markdown", "generated", "search"]),
  name: z.string(),
  url: z.string(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  size: z.number().optional(),
  alt: z.string().optional(),
  prompt: z.string().optional(),
  searchQuery: z.string().optional(),
  attribution: z.string().optional(),
  createdAt: z.string()
});

export const imageInputSchema = z.union([z.string(), imageAssetSchema]);

export const platformImagePlanSchema = z.object({
  role: z.enum(["cover", "gallery", "inline", "meme"]),
  imageAssetId: z.string(),
  order: z.number(),
  title: z.string().optional(),
  caption: z.string().optional()
});
