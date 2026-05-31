import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Platform, PlatformContent } from "@/types";
import type { PlatformPublisher, PublishRequest, PublishResponse } from "./types";
import {
  getAccessToken,
  uploadDefaultCoverMaterial,
  uploadArticleImage,
  uploadArticleImageFromUrl,
  uploadImageMaterial,
  uploadImageFromUrl,
  createDraft,
  publishDraft,
  getPublishedArticleUrl,
  type WechatDraftArticle
} from "./wechat-api";

/**
 * 将 OmniPost PlatformContent 映射为微信草稿格式
 */
function mapToWechatDraft(
  content: PlatformContent,
  bodyHtml: string,
  coverMediaId?: string
): WechatDraftArticle {
  return {
    title: content.title.slice(0, 64), // 微信标题最长 64 字
    digest: (content.digest ?? content.summary ?? "").slice(0, 120),
    content: bodyHtml,
    thumb_media_id: coverMediaId,
    show_cover_pic: coverMediaId ? 1 : 0,
    need_open_comment: 0,
    only_fans_can_comment: 0
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function hasHtmlTag(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function inlineWechatStyles(html: string) {
  return html
    .replace(/<h1(\s[^>]*)?>/gi, '<h1 style="margin:0 0 20px;font-size:24px;line-height:1.45;font-weight:700;color:#111827;">')
    .replace(/<h2(\s[^>]*)?>/gi, '<h2 style="margin:28px 0 12px;padding-left:10px;border-left:4px solid #2563eb;font-size:19px;line-height:1.55;font-weight:700;color:#111827;">')
    .replace(/<h3(\s[^>]*)?>/gi, '<h3 style="margin:22px 0 10px;font-size:17px;line-height:1.55;font-weight:700;color:#111827;">')
    .replace(/<p(\s[^>]*)?>/gi, '<p style="margin:0 0 16px;font-size:16px;line-height:1.9;color:#374151;">')
    .replace(/<blockquote(\s[^>]*)?>/gi, '<blockquote style="margin:18px 0;padding:12px 14px;border-left:4px solid #93c5fd;background:#f8fafc;color:#475569;font-size:15px;line-height:1.85;">')
    .replace(/<ul(\s[^>]*)?>/gi, '<ul style="margin:0 0 18px;padding-left:22px;color:#374151;font-size:16px;line-height:1.9;">')
    .replace(/<ol(\s[^>]*)?>/gi, '<ol style="margin:0 0 18px;padding-left:22px;color:#374151;font-size:16px;line-height:1.9;">')
    .replace(/<li(\s[^>]*)?>/gi, '<li style="margin:0 0 8px;">')
    .replace(/<strong(\s[^>]*)?>/gi, '<strong style="font-weight:700;color:#111827;">')
    .replace(/<figure(\s[^>]*)?>/gi, '<figure style="margin:20px 0;text-align:center;">')
    .replace(/<figcaption(\s[^>]*)?>/gi, '<figcaption style="margin-top:8px;font-size:13px;line-height:1.6;color:#6b7280;">')
    .replace(/<img(\s[^>]*)?>/gi, (match) => {
      if (/style=/.test(match)) {
        return match;
      }

      return match.replace(
        /<img/i,
        '<img style="display:block;max-width:100%;height:auto;margin:0 auto;border-radius:6px;"'
      );
    });
}

function markdownImageToHtml(value: string) {
  const match = value.trim().match(/^!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);

  if (!match) {
    return null;
  }

  const alt = match[1]?.trim() || "正文图片";
  const src = match[2]?.trim() ?? "";
  const caption = match[3]?.trim() || alt;

  return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"/>${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
}

function markdownLikeToHtml(value: string) {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const imageHtml = markdownImageToHtml(block);

      if (imageHtml) {
        return imageHtml;
      }

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

async function buildWechatArticleHtml(content: PlatformContent, accessToken: string) {
  const raw = (content.html ?? content.body).trim();
  const articleHtml = hasHtmlTag(raw) ? inlineWechatStyles(raw) : inlineWechatStyles(markdownLikeToHtml(raw));
  const articleHtmlWithWechatImages = await rewriteInlineImageSources(
    accessToken,
    content,
    articleHtml
  );

  return [
    '<section style="max-width:677px;margin:0 auto;padding:8px 0 24px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Microsoft YaHei,sans-serif;">',
    articleHtmlWithWechatImages,
    '<p style="margin:24px 0 0;font-size:13px;line-height:1.8;color:#9ca3af;">由 OmniPost 辅助生成，请在发布前复核事实与表述。</p>',
    '</section>'
  ].join("");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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

function getContentType(filename: string, fallback?: string) {
  if (fallback) return fallback;
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/jpeg";
}

async function uploadLocalImageAsset(
  accessToken: string,
  asset: NonNullable<PlatformContent["imageAssets"]>[number]
) {
  if (!asset.url.startsWith("/")) {
    return null;
  }

  const normalized = path.normalize(asset.url).replace(/^([/\\])+/, "");
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.join(publicDir, normalized);
  const relative = path.relative(publicDir, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  const bytes = await readFile(filePath);
  const filename = asset.fileName ?? asset.name ?? path.basename(filePath);
  const blob = new Blob([new Uint8Array(bytes)], {
    type: getContentType(filename, asset.mimeType)
  });

  return uploadImageMaterial(accessToken, blob, filename);
}

async function uploadLocalArticleImageAsset(
  accessToken: string,
  asset: NonNullable<PlatformContent["imageAssets"]>[number]
) {
  if (!asset.url.startsWith("/")) {
    return null;
  }

  const normalized = path.normalize(asset.url).replace(/^([/\\])+/, "");
  const publicDir = path.join(process.cwd(), "public");
  const filePath = path.join(publicDir, normalized);
  const relative = path.relative(publicDir, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  const bytes = await readFile(filePath);
  const filename = asset.fileName ?? asset.name ?? path.basename(filePath);
  const blob = new Blob([new Uint8Array(bytes)], {
    type: getContentType(filename, asset.mimeType)
  });

  return uploadArticleImage(accessToken, blob, filename);
}

async function uploadArticleImageAsset(
  accessToken: string,
  asset: NonNullable<PlatformContent["imageAssets"]>[number]
) {
  try {
    if (isHttpUrl(asset.url)) {
      return await uploadArticleImageFromUrl(accessToken, asset.url);
    }

    return await uploadLocalArticleImageAsset(accessToken, asset);
  } catch (error) {
    console.warn(
      `上传正文图片失败: ${asset.url} — ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

async function rewriteInlineImageSources(
  accessToken: string,
  content: PlatformContent,
  html: string
) {
  const srcMatches = Array.from(html.matchAll(/<img\b[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi));

  if (!srcMatches.length) {
    return html;
  }

  const assetsByUrl = new Map((content.imageAssets ?? []).map((asset) => [asset.url, asset]));
  const replacements = new Map<string, string>();

  for (const match of srcMatches) {
    const src = match[1]?.trim();
    const normalizedSrc = src ? decodeHtmlAttribute(src) : "";

    if (!src || replacements.has(src)) {
      continue;
    }

    const asset = assetsByUrl.get(normalizedSrc) ?? assetsByUrl.get(src);

    if (!asset) {
      continue;
    }

    const uploadedUrl = await uploadArticleImageAsset(accessToken, asset);

    if (uploadedUrl) {
      replacements.set(src, uploadedUrl);
    }
  }

  if (!replacements.size) {
    return html;
  }

  return html.replace(
    /(<img\b[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
    (match, before: string, src: string, after: string) =>
      replacements.has(src) ? `${before}${replacements.get(src)}${after}` : match
  );
}

async function uploadPlannedCoverMaterial(
  accessToken: string,
  content: PlatformContent
) {
  const asset = getCoverAsset(content);

  if (!asset) {
    return null;
  }

  try {
    if (isHttpUrl(asset.url)) {
      return await uploadImageFromUrl(accessToken, asset.url);
    }

    return await uploadLocalImageAsset(accessToken, asset);
  } catch (error) {
    console.warn(
      `上传计划封面失败: ${asset.url} — ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

function buildPublishError(
  platform: Platform,
  platformContentId: string,
  message: string
): PublishResponse {
  return {
    platform,
    platformContentId,
    status: "failed",
    url: "",
    error: message
  };
}

export const wechatPublisher: PlatformPublisher = {
  platform: "wechat",

  async publish(request: PublishRequest): Promise<PublishResponse> {
    const { platformContent, credentials } = request;
    const appId = credentials["appId"];
    const appSecret = credentials["appSecret"];

    if (!appId || !appSecret) {
      return buildPublishError(
        "wechat",
        platformContent.id,
        "微信公众号凭据不完整"
      );
    }

    let accessToken: string;
    try {
      accessToken = await getAccessToken(appId, appSecret);
    } catch (error) {
      return buildPublishError(
        "wechat",
        platformContent.id,
        `获取 access_token 失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // 微信草稿接口要求 thumb_media_id 必须是永久图片素材 ID。
    // coverSuggestion 是文字建议时不能直接上传，需回退到默认封面素材。
    let coverMediaId: string | undefined;
    coverMediaId = (await uploadPlannedCoverMaterial(accessToken, platformContent)) ?? undefined;

    if (
      !coverMediaId &&
      platformContent.coverSuggestion &&
      isHttpUrl(platformContent.coverSuggestion)
    ) {
      const result = await uploadImageFromUrl(
        accessToken,
        platformContent.coverSuggestion
      );
      coverMediaId = result ?? undefined;
    }

    if (!coverMediaId) {
      try {
        coverMediaId = await uploadDefaultCoverMaterial(accessToken);
      } catch (error) {
        return buildPublishError(
          "wechat",
          platformContent.id,
          `上传默认封面素材失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // 创建草稿
    const bodyHtml = await buildWechatArticleHtml(platformContent, accessToken);
    const draftArticle = mapToWechatDraft(platformContent, bodyHtml, coverMediaId);

    let mediaId: string;
    try {
      mediaId = await createDraft(accessToken, draftArticle);
    } catch (error) {
      return buildPublishError(
        "wechat",
        platformContent.id,
        `创建草稿失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // 发布草稿
    let publishId: string;
    try {
      publishId = await publishDraft(accessToken, mediaId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/\[48001\]|api unauthorized/i.test(message)) {
        return {
          platform: "wechat",
          platformContentId: platformContent.id,
          status: "drafted",
          url: "",
          message:
            `公众号草稿已创建，但当前账号没有接口直接发布权限，请到公众号后台手动发布。微信返回: ${message}`
        };
      }

      return buildPublishError(
        "wechat",
        platformContent.id,
        `发布草稿失败: ${message}`
      );
    }

    // 获取已发布文章 URL
    const articleUrl = await getPublishedArticleUrl(accessToken, publishId);

    return {
      platform: "wechat",
      platformContentId: platformContent.id,
      status: "success",
      url:
        articleUrl ??
        `https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=10&appmsgid=${publishId}`
    };
  }
};
