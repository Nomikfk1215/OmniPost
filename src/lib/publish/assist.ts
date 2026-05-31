import type { Platform } from "@/types";
import type { PlatformPublisher, PublishRequest, PublishResponse } from "./types";

const MESSAGES: Partial<Record<Platform, string>> = {
  zhihu:
    "知乎当前未开放稳定的官方创作者发文 API。已生成辅助发布包，请打开链接复制标题、正文和话题到知乎后台。",
  xiaohongshu:
    "小红书官方笔记发布 API 需要平台侧权限确认。已生成辅助发布包，请打开链接复制标题、正文、话题和图片到小红书创作后台。",
  bilibili:
    "B站专栏真实发布需要开放平台 OAuth 和 ATC_BASE 权限。已生成辅助发布包，请打开链接复制标题、正文、标签和分区建议到 B站创作后台。"
};

export function createAssistPublisher(platform: Platform): PlatformPublisher {
  return {
    platform,

    async publish(request: PublishRequest): Promise<PublishResponse> {
      return {
        platform,
        platformContentId: request.platformContent.id,
        status: "assist",
        url: `/mock/${platform}/${request.platformContent.id}`,
        message: MESSAGES[platform] ?? "该平台当前走辅助发布包"
      };
    }
  };
}
