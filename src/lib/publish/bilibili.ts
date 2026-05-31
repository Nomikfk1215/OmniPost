import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ImageAsset, PlatformContent } from "@/types";
import type { PlatformPublisher, PublishRequest, PublishResponse } from "./types";
import {
  submitBilibiliArticle,
  uploadBilibiliArticleImage,
  type BilibiliApiAuth
} from "./bilibili-api";

const REQUIRED_ARTICLE_SCOPE = "ATC_BASE";

function fail(platformContentId: string, message: string): PublishResponse {
  return {
    platform: "bilibili",
    platformContentId,
    status: "failed",
    url: "",
    error: message
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function hasHtmlTag(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function markdownImageToFigure(block: string, replacements: Map<string, string>) {
  const match = block.trim().match(/^!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
  if (!match) return null;

  const alt = match[1]?.trim() || "图片";
  const rawUrl = match[2]?.trim() ?? "";
  const url = replacements.get(rawUrl) ?? rawUrl;
  const caption = match[3]?.trim() || alt;

  return `<figure class="img-box" contenteditable="false"><img src="${escapeHtml(url)}"><figcaption class="caption" contenteditable="">${escapeHtml(caption)}</figcaption></figure>`;
}

function markdownLikeToHtml(value: string, replacements: Map<string, string>) {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const figure = markdownImageToFigure(block, replacements);
      if (figure) return figure;

      if (/^#{1,3}\s+/.test(block)) {
        const level = Math.min(3, block.match(/^#+/)?.[0].length ?? 2);
        return `<h${level}>${escapeHtml(block.replace(/^#{1,3}\s+/, ""))}</h${level}>`;
      }

      if (/^[-*]\s+/m.test(block)) {
        const items = block
          .split(/\n+/)
          .map((line) => line.replace(/^[-*]\s+/, "").trim())
          .filter(Boolean)
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${escapeHtml(block).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
}

function getContentType(filename: string, fallback?: string) {
  if (fallback) return fallback;

  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function imageBlobFromAsset(asset: ImageAsset) {
  if (isHttpUrl(asset.url)) {
    const response = await fetch(asset.url);
    if (!response.ok) {
      throw new Error(`下载图片失败: HTTP ${response.status}`);
    }

    return response.blob();
  }

  if (!asset.url.startsWith("/")) {
    throw new Error("图片地址不是可上传的本地或 HTTP URL");
  }

  const normalized = path.normalize(asset.url).replace(/^([/\\])+/, "");
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.join(publicDir, normalized);
  const relative = path.relative(publicDir, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("图片路径不在 public 目录内");
  }

  const bytes = await readFile(filePath);
  return new Blob([new Uint8Array(bytes)], {
    type: getContentType(asset.fileName ?? asset.name, asset.mimeType)
  });
}

async function uploadAsset(
  auth: BilibiliApiAuth,
  asset: ImageAsset
) {
  const image = await imageBlobFromAsset(asset);
  const filename = asset.fileName ?? asset.name ?? "image.jpg";
  const uploaded = await uploadBilibiliArticleImage({
    auth,
    image,
    filename,
    watermark: false
  });

  return uploaded.url;
}

function getCoverAsset(content: PlatformContent) {
  const assets = content.imageAssets ?? [];
  const coverPlan = (content.imagePlan ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .find((plan) => plan.role === "cover");

  return (
    assets.find((asset) => asset.id === coverPlan?.imageAssetId) ??
    assets[0] ??
    null
  );
}

async function uploadContentImages(
  auth: BilibiliApiAuth,
  content: PlatformContent
) {
  const replacements = new Map<string, string>();

  for (const asset of content.imageAssets ?? []) {
    try {
      const uploadedUrl = await uploadAsset(auth, asset);
      replacements.set(asset.url, uploadedUrl);
    } catch (error) {
      console.warn(
        `Bilibili image upload failed: ${asset.url} ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return replacements;
}

function applyImageReplacements(html: string, replacements: Map<string, string>) {
  let nextHtml = html;

  for (const [from, to] of replacements) {
    nextHtml = nextHtml.split(from).join(to);
  }

  return nextHtml;
}

function buildArticleContent(
  content: PlatformContent,
  replacements: Map<string, string>
) {
  const raw = (content.html ?? content.body).trim();
  const html = hasHtmlTag(raw)
    ? raw
    : markdownLikeToHtml(raw, replacements);

  return applyImageReplacements(html, replacements);
}

function getCategory(content: PlatformContent) {
  const fromSuggestion = content.categorySuggestion?.match(/\d+/)?.[0];
  const value =
    fromSuggestion ?? process.env.OMNIPOST_BILIBILI_DEFAULT_CATEGORY ?? "1";
  const category = Number.parseInt(value, 10);
  return Number.isFinite(category) && category > 0 ? category : 1;
}

function getSummary(content: PlatformContent) {
  const source = [
    content.description,
    content.summary,
    content.openingConclusion,
    stripHtml(content.body)
  ]
    .filter(Boolean)
    .join(" ");

  return stripHtml(source).slice(0, 240);
}

function getApiAuth(request: PublishRequest): BilibiliApiAuth | null {
  if (request.auth.kind !== "oauth") {
    return null;
  }

  const clientId = process.env.OMNIPOST_BILIBILI_CLIENT_ID?.trim();
  const clientSecret = process.env.OMNIPOST_BILIBILI_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    accessToken: request.auth.account.accessToken,
    clientId,
    clientSecret
  };
}

export const bilibiliPublisher: PlatformPublisher = {
  platform: "bilibili",

  async publish(request: PublishRequest): Promise<PublishResponse> {
    const { platformContent } = request;

    if (request.auth.kind !== "oauth") {
      return fail(
        platformContent.id,
        request.auth.kind === "none"
          ? request.auth.reason
          : "B站真实发布需要 OAuth 授权"
      );
    }

    if (
      request.auth.account.scopes.length > 0 &&
      !request.auth.account.scopes.includes(REQUIRED_ARTICLE_SCOPE)
    ) {
      return fail(
        platformContent.id,
        `B站授权缺少 ${REQUIRED_ARTICLE_SCOPE} 专栏投稿权限，请重新授权`
      );
    }

    const auth = getApiAuth(request);
    if (!auth) {
      return fail(
        platformContent.id,
        "B站开放平台 Client ID/Client Secret 未配置"
      );
    }

    const replacements = await uploadContentImages(auth, platformContent);
    const coverAsset = getCoverAsset(platformContent);
    const bannerUrl = coverAsset
      ? replacements.get(coverAsset.url) ?? (isHttpUrl(coverAsset.url) ? coverAsset.url : undefined)
      : undefined;

    try {
      const article = await submitBilibiliArticle(auth, {
        title: platformContent.title.slice(0, 40),
        category: getCategory(platformContent),
        templateId: bannerUrl ? 4 : 5,
        summary: getSummary(platformContent),
        content: buildArticleContent(platformContent, replacements),
        bannerUrl,
        original: 1,
        imageUrls: bannerUrl ? [bannerUrl] : undefined,
        tags: (platformContent.tags ?? []).map((tag) => tag.replace(/^#/, "")),
        upClosedReply: 0
      });

      return {
        platform: "bilibili",
        platformContentId: platformContent.id,
        status: "success",
        url: `https://www.bilibili.com/read/cv${article.id}`,
        message: `B站文章已提交，稿件 ID: ${article.id}`
      };
    } catch (error) {
      return fail(
        platformContent.id,
        `B站文章提交失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
};
