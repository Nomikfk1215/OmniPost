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

function textNodes(lines: string[], startY: number, size: number, weight = 600) {
  return lines
    .map(
      (line, index) =>
        `<text x="72" y="${startY + index * (size + 14)}" font-size="${size}" font-weight="${weight}" fill="currentColor">${escapeXml(line)}</text>`
    )
    .join("");
}

function buildCardSvg(params: {
  title: string;
  caption: string;
  index: number;
}) {
  const palette = palettes[params.index % palettes.length];
  const titleLines = wrapText(params.title, 11, 3);
  const captionLines = wrapText(params.caption, 18, 6);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200" role="img" aria-label="${escapeXml(params.title)}">
  <rect width="900" height="1200" fill="${palette.bg}"/>
  <rect x="44" y="44" width="812" height="1112" rx="36" fill="#ffffff" opacity="0.84"/>
  <circle cx="754" cy="164" r="94" fill="${palette.soft}" opacity="0.8"/>
  <circle cx="136" cy="1034" r="128" fill="${palette.soft}" opacity="0.55"/>
  <rect x="72" y="92" width="112" height="38" rx="19" fill="${palette.accent}" opacity="0.14"/>
  <text x="98" y="118" font-size="21" font-weight="700" fill="${palette.accent}">OmniPost</text>
  <g style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif; color: ${palette.ink};">
    ${textNodes(titleLines, 258, 58, 800)}
    <rect x="72" y="520" width="72" height="8" rx="4" fill="${palette.accent}"/>
    ${textNodes(captionLines, 610, 35, 500)}
  </g>
  <text x="72" y="1088" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif" font-size="28" font-weight="700" fill="${palette.accent}"># ${params.index + 1}</text>
</svg>`;
}

export async function createGeneratedCardImages(params: {
  title: string;
  body: string;
  imageSuggestions?: string[];
  count?: number;
}) {
  const count = params.count ?? 3;
  const suggestions = params.imageSuggestions?.length
    ? params.imageSuggestions
    : [
        summarizeText(params.body, 72),
        "把正文重点整理成可滑动的卡片图",
        "用一张结论卡承接正文观点"
      ];
  const images: ImageAsset[] = [];

  await mkdir(generatedDir, { recursive: true });

  for (let index = 0; index < count; index += 1) {
    const id = createId("img");
    const fileName = `${id}.svg`;
    const title = index === 0 ? params.title : `图 ${index + 1}`;
    const caption = suggestions[index] ?? suggestions[suggestions.length - 1] ?? params.title;
    const svg = buildCardSvg({ title, caption, index });

    await writeFile(path.join(generatedDir, fileName), svg, "utf8");
    images.push({
      id,
      source: "generated",
      name: `${title}.svg`,
      fileName,
      url: `/uploads/generated/${fileName}`,
      mimeType: "image/svg+xml",
      width: 900,
      height: 1200,
      alt: caption,
      prompt: caption,
      createdAt: new Date().toISOString()
    });
  }

  return images;
}
