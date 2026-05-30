import { NextResponse } from "next/server";
import { z } from "zod";
import { createId } from "@/lib/utils";
import type { ImageAsset } from "@/types";

export const runtime = "nodejs";

const searchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(8).optional()
});

function stripHtml(value: string | undefined) {
  return value?.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function titleToName(title: string) {
  return title.replace(/^File:/i, "").trim() || "search-image";
}

export async function POST(request: Request) {
  const payload = searchSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "invalid query" }, { status: 400 });
  }

  const limit = payload.data.limit ?? 6;
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", String(limit));
  url.searchParams.set("gsrsearch", payload.data.query);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|mime|size|extmetadata");

  const response = await fetch(url, { next: { revalidate: 3600 } });

  if (!response.ok) {
    return NextResponse.json({ error: "image search failed" }, { status: 502 });
  }

  const data = (await response.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          title: string;
          imageinfo?: Array<{
            url?: string;
            mime?: string;
            width?: number;
            height?: number;
            extmetadata?: Record<string, { value?: string }>;
          }>;
        }
      >;
    };
  };
  const pages = Object.values(data.query?.pages ?? {});
  const now = new Date().toISOString();
  const images: ImageAsset[] = pages
    .map((page) => {
      const imageInfo = page.imageinfo?.[0];

      if (!imageInfo?.url || !imageInfo.mime?.startsWith("image/")) {
        return null;
      }

      const name = titleToName(page.title);
      const credit =
        stripHtml(imageInfo.extmetadata?.Credit?.value) ??
        stripHtml(imageInfo.extmetadata?.Artist?.value) ??
        "Wikimedia Commons";

      return {
        id: createId("img"),
        source: "search",
        name,
        url: imageInfo.url,
        mimeType: imageInfo.mime,
        width: imageInfo.width,
        height: imageInfo.height,
        alt: name,
        searchQuery: payload.data.query,
        attribution: credit,
        createdAt: now
      };
    })
    .filter(Boolean) as ImageAsset[];

  return NextResponse.json({ images });
}
