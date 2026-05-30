import { createId } from "@/lib/utils";
import type { ImageAsset } from "@/types";

type ImageInput = ImageAsset | string;

const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export type ImagePosition = {
  url: string;
  alt: string;
  lineIndex: number;
  context: string;
};

function getNameFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : parsed.hostname;
  } catch {
    const segment = url.split(/[\\/]/).filter(Boolean).pop();
    return segment || "image";
  }
}

function imageFromUrl(url: string, source: ImageAsset["source"], now: string, alt?: string): ImageAsset {
  return {
    id: createId("img"),
    source,
    name: alt?.trim() || getNameFromUrl(url),
    url,
    alt: alt?.trim() || undefined,
    createdAt: now
  };
}

export function extractMarkdownImageAssets(rawText: string, now = new Date().toISOString()) {
  const images: ImageAsset[] = [];
  let match: RegExpExecArray | null;

  while ((match = markdownImagePattern.exec(rawText))) {
    const [, alt = "", url = ""] = match;
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      continue;
    }

    images.push(imageFromUrl(cleanUrl, "markdown", now, alt));
  }

  return images;
}

export function extractImagePositions(rawText: string): ImagePosition[] {
  const lines = rawText.split("\n");
  const results: ImagePosition[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const pattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(lines[lineIndex]))) {
      const [, alt = "", url = ""] = match;
      const cleanUrl = url.trim();

      if (!cleanUrl) {
        continue;
      }

      // Collect surrounding text lines (1 before, 1 after) as context
      const contextLines: string[] = [];
      if (lineIndex > 0) {
        const before = lines[lineIndex - 1].trim();
        if (before && !/^!\[.*\]\(.*\)$/.test(before)) {
          contextLines.push(before);
        }
      }
      if (lineIndex < lines.length - 1) {
        const after = lines[lineIndex + 1].trim();
        if (after && !/^!\[.*\]\(.*\)$/.test(after)) {
          contextLines.push(after);
        }
      }

      results.push({
        url: cleanUrl,
        alt: alt.trim(),
        lineIndex,
        context: contextLines.join(" | ").slice(0, 200)
      });
    }
  }

  return results;
}

export function normalizeImageAssets(images: ImageInput[] | undefined, now = new Date().toISOString()) {
  return (images ?? [])
    .map((image) => {
      if (typeof image === "string") {
        return imageFromUrl(image, "upload", now);
      }

      return {
        ...image,
        name: image.name || image.alt || getNameFromUrl(image.url),
        createdAt: image.createdAt || now
      };
    })
    .filter((image) => Boolean(image.url));
}

export function collectContentImages(params: {
  rawText: string;
  images?: ImageInput[];
}) {
  const now = new Date().toISOString();
  const existing = normalizeImageAssets(params.images, now);
  const markdownImages = extractMarkdownImageAssets(params.rawText, now);
  const seen = new Set<string>();

  return [...existing, ...markdownImages].filter((image) => {
    const key = image.url.trim();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
