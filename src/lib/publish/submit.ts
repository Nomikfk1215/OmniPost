// 确保 Publisher 已注册
import "./init";

import { createId } from "@/lib/utils";
import { readStore, writeStore } from "@/lib/db/json-store";
import { upsertManyPlatformContents } from "@/lib/db/platform-contents";
import { getDecryptedCredentials } from "@/lib/db/platform-credentials";
import { getPublisher } from "./registry";
import type {
  PlatformContent,
  PublishMode,
  PublishTask,
  PublishResult
} from "@/types";

type SubmitParams = {
  contentId: string;
  title: string;
  mode: PublishMode;
  platformContents: PlatformContent[];
};

/**
 * 统一发布入口。
 * mode === "mock" → 走原有模拟逻辑
 * mode === "real" → 逐平台调用真实 Publisher
 */
export async function submitPublish(
  params: SubmitParams
): Promise<PublishTask> {
  const now = new Date().toISOString();
  const taskId = createId("publish");

  // 持久化最新版本的平台内容
  const savedContents = await upsertManyPlatformContents(
    params.platformContents
  );

  const results: PublishResult[] = [];

  for (const pc of savedContents) {
    if (params.mode === "real") {
      const publisher = getPublisher(pc.platform);

      if (!publisher) {
        results.push({
          id: createId("result"),
          platform: pc.platform,
          platformContentId: pc.id,
          status: "failed",
          url: "",
          message: `平台 ${pc.platform} 暂不支持真实发布`
        });
        continue;
      }

      const credentials = await getDecryptedCredentials(pc.platform);

      if (!credentials) {
        results.push({
          id: createId("result"),
          platform: pc.platform,
          platformContentId: pc.id,
          status: "failed",
          url: "",
          message: `平台 ${pc.platform} 未配置发布凭证，请在设置中配置`
        });
        continue;
      }

      const response = await publisher.publish({
        contentId: params.contentId,
        title: params.title,
        platformContent: pc,
        credentials
      });

      results.push({
        id: createId("result"),
        platform: response.platform,
        platformContentId: response.platformContentId,
        status: response.status,
        url: response.url,
        message: response.error
      });
    } else {
      // Mock 模式
      results.push({
        id: createId("result"),
        platform: pc.platform,
        platformContentId: pc.id,
        status: "success",
        url: `/mock/${pc.platform}/${pc.id}`
      });
    }
  }

  // 聚合状态
  const successCount = results.filter((r) => r.status === "success").length;
  const totalCount = results.length;
  const status =
    successCount === totalCount
      ? "success"
      : successCount === 0
        ? "failed"
        : "partial";

  const task: PublishTask = {
    id: taskId,
    contentId: params.contentId,
    title: params.title,
    mode: params.mode,
    status,
    results,
    createdAt: now,
    finishedAt: now
  };

  // 持久化
  const store = await readStore();
  await writeStore({ ...store, publishTasks: [task, ...store.publishTasks] });

  return task;
}
