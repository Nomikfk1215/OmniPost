import type { Platform, PlatformContent } from "@/types";
import type { PlatformPublisher, PublishRequest, PublishResponse } from "./types";
import {
  getAccessToken,
  uploadDefaultCoverMaterial,
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
  coverMediaId?: string
): WechatDraftArticle {
  // 优先使用 html 字段（公众号正文为 HTML），fallback 为 body
  const bodyHtml = content.html ?? content.body;

  return {
    title: content.title.slice(0, 64), // 微信标题最长 64 字
    digest: (content.digest ?? content.summary ?? "").slice(0, 120),
    content: bodyHtml,
    thumb_media_id: coverMediaId,
    need_open_comment: 0,
    only_fans_can_comment: 0
  };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
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
    if (
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
    const draftArticle = mapToWechatDraft(platformContent, coverMediaId);

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
      return buildPublishError(
        "wechat",
        platformContent.id,
        `发布草稿失败: ${error instanceof Error ? error.message : String(error)}`
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
