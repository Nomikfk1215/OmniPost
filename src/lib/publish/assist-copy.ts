import type { PlatformContent } from "@/types";

type AssistCopyPayload = {
  html: string;
  text: string;
};

export type AssistCopyImage = {
  id: string;
  url: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

function hasHtmlTag(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeUrl(url: string, baseUrl?: string) {
  if (!baseUrl || /^(https?:|data:|blob:)/i.test(url)) {
    return url;
  }

  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function cleanListMarker(value: string) {
  return value.trim().replace(/^[-*]\s+/, "").replace(/^\d+[.)、]\s+/, "");
}

function parseMarkdownImage(value: string) {
  const match = value.trim().match(/^!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);

  if (!match) return null;

  return {
    alt: match[1]?.trim() || "图片",
    url: match[2]?.trim() ?? "",
    title: match[3]?.trim()
  };
}

function imageIdFromUrl(value: string) {
  try {
    const url = new URL(value, "http://local");
    return decodeURIComponent(url.pathname.split("/").pop() ?? value);
  } catch {
    return value;
  }
}

function markdownLikeToHtml(value: string, baseUrl?: string) {
  if (hasHtmlTag(value)) {
    return sanitizeHtml(value);
  }

  const lines = value.split(/\r?\n/);
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const image = parseMarkdownImage(line);
    if (image) {
      const src = escapeHtml(normalizeUrl(image.url, baseUrl));
      const alt = escapeHtml(image.alt);
      blocks.push(
        `<figure><img src="${src}" alt="${alt}" data-omnipost-image="${escapeHtml(imageIdFromUrl(image.url))}" /></figure>`
      );
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      blocks.push(`<h2>${renderInlineMarkdown(heading[2])}</h2>`);
      index += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      blocks.push(`<blockquote>${renderInlineMarkdown(line.replace(/^>\s+/, ""))}</blockquote>`);
      index += 1;
      continue;
    }

    const ordered = /^\d+[.)、]\s+/.test(line);
    const unordered = /^[-*]\s+/.test(line);
    if (ordered || unordered) {
      const items: string[] = [];

      while (index < lines.length) {
        const itemLine = lines[index].trim();
        const itemMatches = ordered
          ? /^\d+[.)、]\s+/.test(itemLine)
          : /^[-*]\s+/.test(itemLine);

        if (!itemMatches) break;

        items.push(`<li>${renderInlineMarkdown(cleanListMarker(itemLine))}</li>`);
        index += 1;
      }

      blocks.push(`<${ordered ? "ol" : "ul"}>${items.join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }

    blocks.push(`<p>${renderInlineMarkdown(line)}</p>`);
    index += 1;
  }

  return blocks.join("");
}

function htmlToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|blockquote|figure|ul|ol)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<figcaption[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatTags(tags: string[] | undefined) {
  return (tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
    .join(" ");
}

function getPlannedImageHtml(content: PlatformContent, baseUrl?: string) {
  if (content.platform === "zhihu") {
    return "";
  }

  const assets = content.imageAssets ?? [];
  const body = content.body || content.html || "";
  const planned = (content.imagePlan ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((plan) => assets.find((asset) => asset.id === plan.imageAssetId))
    .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset))
    .filter((asset) => !body.includes(asset.url));

  return planned
    .map((asset) => {
      const src = escapeHtml(normalizeUrl(asset.url, baseUrl));
      const alt = escapeHtml(asset.alt ?? asset.name);
      return `<figure><img src="${src}" alt="${alt}" data-omnipost-image="${escapeHtml(asset.id)}" /></figure>`;
    })
    .join("");
}

export function getAssistCopyImages(content: PlatformContent, baseUrl?: string): AssistCopyImage[] {
  const images = new Map<string, AssistCopyImage>();

  for (const asset of content.imageAssets ?? []) {
    images.set(asset.id, {
      id: asset.id,
      url: normalizeUrl(asset.url, baseUrl)
    });
  }

  const markdownImagePattern = /!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g;
  let match: RegExpExecArray | null;

  while ((match = markdownImagePattern.exec(content.body || content.html || ""))) {
    const url = match[2]?.trim();
    if (url) {
      const id = imageIdFromUrl(url);
      images.set(id, { id, url: normalizeUrl(url, baseUrl) });
    }
  }

  return Array.from(images.values());
}

export function buildAssistCopyPayload(
  content: PlatformContent,
  baseUrl?: string
): AssistCopyPayload {
  const bodyHtml = markdownLikeToHtml(content.body || content.html || "", baseUrl);
  const tags = formatTags(content.tags);
  const plannedImages = getPlannedImageHtml(content, baseUrl);

  const introHtml = [
    content.platform === "zhihu" && content.openingConclusion
      ? `<p>${escapeHtml(content.openingConclusion)}</p>`
      : "",
    content.platform === "bilibili" && content.description
      ? `<p>${escapeHtml(content.description)}</p>`
      : ""
  ].join("");

  const metaHtml = [
    content.categorySuggestion ? `<p>${escapeHtml(content.categorySuggestion)}</p>` : "",
    content.coverSuggestion ? `<p>${escapeHtml(content.coverSuggestion)}</p>` : "",
    content.interactionGuide ? `<p>${escapeHtml(content.interactionGuide)}</p>` : "",
    tags ? `<p>${escapeHtml(tags)}</p>` : ""
  ].join("");

  const html = [
    "<article>",
    `<h1>${escapeHtml(content.title)}</h1>`,
    plannedImages,
    introHtml,
    bodyHtml,
    metaHtml,
    "</article>"
  ].join("");

  return {
    html,
    text: htmlToPlainText(html)
  };
}

export function buildAssistCopyText(content: PlatformContent, baseUrl?: string) {
  return buildAssistCopyPayload(content, baseUrl).text;
}
