import { createId } from "@/lib/utils";
import type { ImageAsset } from "@/types";

type ImageInput = ImageAsset | string;

const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const htmlImagePattern = /<img\b[^>]*\ssrc=(["'])(.*?)\1[^>]*>/gi;

export type ImagePosition = {
  url: string;
  alt: string;
  lineIndex: number;
  order: number;
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

function normalizeImageKey(url: string) {
  return url.trim();
}

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getHtmlAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`${name}=(["'])(.*?)\\1`, "i"));
  return match?.[2] ? decodeHtmlAttribute(match[2]) : "";
}

function isInlineImageOnly(value: string) {
  const trimmed = value.trim();
  return (
    /^!\[[^\]]*]\([^)]+\)$/.test(trimmed) ||
    /^<figure[\s\S]*<img\b[\s\S]*<\/figure>$/i.test(trimmed) ||
    /^<img\b[\s\S]*>$/i.test(trimmed)
  );
}

function mergeMarkdownImageWithExisting(markdown: ImageAsset, existing?: ImageAsset): ImageAsset {
  if (!existing) {
    return markdown;
  }

  return {
    ...existing,
    source: "markdown",
    name: markdown.alt || existing.name || markdown.name,
    url: markdown.url,
    alt: markdown.alt ?? existing.alt,
    createdAt: existing.createdAt || markdown.createdAt
  };
}

export function extractMarkdownImageAssets(rawText: string, now = new Date().toISOString()) {
  const images: ImageAsset[] = [];
  let match: RegExpExecArray | null;
  markdownImagePattern.lastIndex = 0;

  while ((match = markdownImagePattern.exec(rawText))) {
    const [, alt = "", url = ""] = match;
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      continue;
    }

    images.push(imageFromUrl(cleanUrl, "markdown", now, alt));
  }

  htmlImagePattern.lastIndex = 0;

  while ((match = htmlImagePattern.exec(rawText))) {
    const [tag, , url = ""] = match;
    const cleanUrl = decodeHtmlAttribute(url).trim();

    if (!cleanUrl) {
      continue;
    }

    images.push(imageFromUrl(cleanUrl, "markdown", now, getHtmlAttribute(tag, "alt")));
  }

  return images;
}

export function extractImagePositions(rawText: string): ImagePosition[] {
  const lines = rawText.split(/\r?\n/);
  const positions: ImagePosition[] = [];

  lines.forEach((line, lineIndex) => {
    const pattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line))) {
      const [, alt = "", url = ""] = match;
      const cleanUrl = normalizeImageKey(url);

      if (!cleanUrl) {
        continue;
      }

      const contextLines = [lines[lineIndex - 1], line.replace(match[0], "").trim(), lines[lineIndex + 1]]
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item && !isInlineImageOnly(item)));

      positions.push({
        url: cleanUrl,
        alt: alt.trim(),
        lineIndex,
        order: positions.length,
        context: contextLines.join(" | ").slice(0, 240)
      });
    }
  });

  htmlImagePattern.lastIndex = 0;

  let match: RegExpExecArray | null;

  while ((match = htmlImagePattern.exec(rawText))) {
    const [tag, , url = ""] = match;
    const cleanUrl = decodeHtmlAttribute(url).trim();

    if (!cleanUrl || positions.some((position) => position.url === cleanUrl)) {
      continue;
    }

    const before = stripHtml(rawText.slice(Math.max(0, match.index - 500), match.index));
    const after = stripHtml(rawText.slice(htmlImagePattern.lastIndex, htmlImagePattern.lastIndex + 500));

    positions.push({
      url: cleanUrl,
      alt: getHtmlAttribute(tag, "alt"),
      lineIndex: rawText.slice(0, match.index).split(/\r?\n/).length - 1,
      order: positions.length,
      context: [before.split(/[。！？!?]/).filter(Boolean).pop(), after.split(/[。！？!?]/).find(Boolean)]
        .filter(Boolean)
        .join(" | ")
        .slice(0, 240)
    });
  }

  return positions;
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
  const existingByUrl = new Map(existing.map((image) => [normalizeImageKey(image.url), image]));
  const markdownUrls = new Set(markdownImages.map((image) => normalizeImageKey(image.url)));
  const inlineImages = markdownImages.map((image) =>
    mergeMarkdownImageWithExisting(image, existingByUrl.get(normalizeImageKey(image.url)))
  );
  const standaloneImages = existing.filter((image) => !markdownUrls.has(normalizeImageKey(image.url)));
  const seen = new Set<string>();

  return [...inlineImages, ...standaloneImages].filter((image) => {
    const key = normalizeImageKey(image.url);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
