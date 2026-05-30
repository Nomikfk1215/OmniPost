import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createId, summarizeText } from "@/lib/utils";
import type { ImageAsset } from "@/types";

const generatedDir = path.join(process.cwd(), "public", "uploads", "generated");

const palettes = [
  { bg: "#fff7ed", accent: "#fb7185", ink: "#111827", soft: "#fed7aa" },
  { bg: "#ecfeff", accent: "#0891b2", ink: "#0f172a", soft: "#bae6fd" },
  { bg: "#f7fee7", accent: "#65a30d", ink: "#1f2937", soft: "#d9f99d" }
];

const dimensions = {
  "3:4": { width: 900, height: 1200, titleSize: 58, captionSize: 35, maxTitle: 11, maxCaption: 18 },
  "2:1": { width: 1200, height: 600, titleSize: 56, captionSize: 32, maxTitle: 18, maxCaption: 28 },
  "16:9": { width: 1280, height: 720, titleSize: 58, captionSize: 34, maxTitle: 18, maxCaption: 30 }
} as const;

type GeneratedAspect = keyof typeof dimensions;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(value: string, maxPerLine: number, maxLines: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  const lines: string[] = [];

  for (let index = 0; index < clean.length && lines.length < maxLines; index += maxPerLine) {
    lines.push(clean.slice(index, index + maxPerLine));
  }

  return lines;
}

function textNodes(lines: string[], startY: number, size: number, weight = 600, x = 72) {
  return lines
    .map(
      (line, index) =>
        `<text x="${x}" y="${startY + index * (size + 14)}" font-size="${size}" font-weight="${weight}" fill="currentColor">${escapeXml(line)}</text>`
    )
    .join("");
}

function stripMarkdown(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/[#>*_`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isVisualInstruction(value: string) {
  return /(封面|配图|插图|图片|卡片图|信息图|风格|背景|色调|画面|构图|氛围|低饱和|大字报|3:4|2:1|16:9)/.test(value);
}

function extractQuotedText(value: string) {
  const matches = Array.from(value.matchAll(/[“"‘']([^“”"‘’']{6,60})[”"’']/g))
    .map((match) => match[1]?.trim())
    .filter(Boolean) as string[];

  return matches.find((item) => !isVisualInstruction(item) || /[？?]/.test(item));
}

export function cleanGeneratedImageText(value?: string) {
  const raw = stripMarkdown(value ?? "");

  if (!raw) {
    return "";
  }

  const quoted = extractQuotedText(raw);

  if (quoted) {
    return summarizeText(quoted, 42);
  }

  const withoutLead = raw
    .replace(/^(封面|配图|插图|图片|卡片图|信息图|第[一二三四五六七八九\d]+张)(（[^）]+）)?[：:]\s*/u, "")
    .replace(/(背景|色调|画面|构图|氛围|风格|配色)[^。；;]*$/u, "")
    .trim();
  const segments = withoutLead
    .split(/[。；;，,]/)
    .map((item) => item.replace(/^(主标题|副标题|标题)[：:'‘’\s]*/u, "").trim())
    .filter((item) => item.length >= 6);
  const meaningful = segments.find((item) => !isVisualInstruction(item) || /[？?]/.test(item));

  return summarizeText(meaningful ?? withoutLead, 46);
}

function extractBodySentences(body: string) {
  return stripMarkdown(body)
    .split(/(?<=[。！？!?])|[\n\r]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 10 && item.length <= 80 && !isVisualInstruction(item))
    .sort((left, right) => {
      const leftScore = /[？?]|为什么|怎么|关键|真正|不是|而是|所以|结论/.test(left) ? 0 : 1;
      const rightScore = /[？?]|为什么|怎么|关键|真正|不是|而是|所以|结论/.test(right) ? 0 : 1;
      return leftScore - rightScore;
    });
}

function buildCardTexts(params: {
  title: string;
  body: string;
  imageSuggestions?: string[];
  count: number;
}) {
  const cleanTitle = cleanGeneratedImageText(params.title) || summarizeText(stripMarkdown(params.title), 42);
  const suggestions = (params.imageSuggestions ?? [])
    .map(cleanGeneratedImageText)
    .filter(Boolean);
  const bodySentences = extractBodySentences(params.body);
  const pool = Array.from(new Set([cleanTitle, ...suggestions, ...bodySentences].filter(Boolean)));

  while (pool.length < params.count + 1) {
    pool.push(cleanTitle || "这件事真正值得讨论的是什么？");
  }

  return pool.slice(0, params.count + 1);
}

function buildCardSvg(params: {
  title: string;
  caption: string;
  index: number;
  aspect: GeneratedAspect;
}) {
  const palette = palettes[params.index % palettes.length];
  const size = dimensions[params.aspect];
  const titleLines = wrapText(params.title, size.maxTitle, params.aspect === "3:4" ? 3 : 2);
  const captionLines = wrapText(params.caption, size.maxCaption, params.aspect === "3:4" ? 5 : 3);
  const outerPadding = params.aspect === "3:4" ? 44 : 38;
  const innerPadding = params.aspect === "3:4" ? 72 : 76;
  const titleY = params.aspect === "3:4" ? 258 : 220;
  const dividerY = params.aspect === "3:4" ? 520 : 390;
  const captionY = params.aspect === "3:4" ? 610 : 462;
  const footerY = size.height - (params.aspect === "3:4" ? 112 : 64);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" role="img" aria-label="${escapeXml(params.title)}">
  <rect width="${size.width}" height="${size.height}" fill="${palette.bg}"/>
  <rect x="${outerPadding}" y="${outerPadding}" width="${size.width - outerPadding * 2}" height="${size.height - outerPadding * 2}" rx="36" fill="#ffffff" opacity="0.86"/>
  <circle cx="${size.width - 150}" cy="${params.aspect === "3:4" ? 164 : 138}" r="${params.aspect === "3:4" ? 94 : 120}" fill="${palette.soft}" opacity="0.75"/>
  <circle cx="${params.aspect === "3:4" ? 136 : 160}" cy="${size.height - 150}" r="${params.aspect === "3:4" ? 128 : 90}" fill="${palette.soft}" opacity="0.5"/>
  <rect x="${innerPadding}" y="${params.aspect === "3:4" ? 92 : 82}" width="112" height="38" rx="19" fill="${palette.accent}" opacity="0.14"/>
  <text x="${innerPadding + 26}" y="${params.aspect === "3:4" ? 118 : 108}" font-size="21" font-weight="700" fill="${palette.accent}">OmniPost</text>
  <g style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif; color: ${palette.ink};">
    ${textNodes(titleLines, titleY, size.titleSize, 800, innerPadding)}
    <rect x="${innerPadding}" y="${dividerY}" width="72" height="8" rx="4" fill="${palette.accent}"/>
    ${textNodes(captionLines, captionY, size.captionSize, 500, innerPadding)}
  </g>
  <text x="${innerPadding}" y="${footerY}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif" font-size="28" font-weight="700" fill="${palette.accent}"># ${params.index + 1}</text>
</svg>`;
}

export async function createGeneratedCardImages(params: {
  title: string;
  body: string;
  imageSuggestions?: string[];
  count?: number;
  aspect?: GeneratedAspect;
}) {
  const count = params.count ?? 3;
  const aspect = params.aspect ?? "3:4";
  const size = dimensions[aspect];
  const texts = buildCardTexts({
    title: params.title,
    body: params.body,
    imageSuggestions: params.imageSuggestions,
    count
  });
  const images: ImageAsset[] = [];

  await mkdir(generatedDir, { recursive: true });

  for (let index = 0; index < count; index += 1) {
    const id = createId("img");
    const fileName = `${id}.svg`;
    const title = index === 0 ? texts[0] : texts[index];
    const caption = texts[index + 1] ?? texts[index] ?? texts[0];
    const svg = buildCardSvg({ title, caption, index, aspect });

    await writeFile(path.join(generatedDir, fileName), svg, "utf8");
    images.push({
      id,
      source: "generated",
      name: `${title}.svg`,
      fileName,
      url: `/uploads/generated/${fileName}`,
      mimeType: "image/svg+xml",
      width: size.width,
      height: size.height,
      alt: title,
      prompt: caption,
      createdAt: new Date().toISOString()
    });
  }

  return images;
}
