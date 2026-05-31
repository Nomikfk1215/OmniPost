import "./init";

import { readStore, writeStore } from "@/lib/db/json-store";
import { upsertManyPlatformContents } from "@/lib/db/platform-contents";
import { createId } from "@/lib/utils";
import { createAssistPublisher } from "./assist";
import { getPublishAuth } from "./auth";
import { getPublishCapability } from "./capabilities";
import { getPublisher } from "./registry";
import type {
  PlatformContent,
  PublishMode,
  PublishResult,
  PublishTask
} from "@/types";

type SubmitParams = {
  contentId: string;
  title: string;
  mode: PublishMode;
  platformContents: PlatformContent[];
};

function aggregateStatus(results: PublishResult[]): PublishTask["status"] {
  const totalCount = results.length;
  const successCount = results.filter((result) => result.status === "success").length;
  const draftedCount = results.filter((result) => result.status === "drafted").length;
  const assistCount = results.filter((result) => result.status === "assist").length;
  const failedCount = results.filter((result) => result.status === "failed").length;

  if (successCount === totalCount) return "success";
  if (draftedCount === totalCount) return "drafted";
  if (assistCount === totalCount) return "assist";
  if (failedCount === totalCount) return "failed";
  return "partial";
}

export async function submitPublish(
  params: SubmitParams
): Promise<PublishTask> {
  const now = new Date().toISOString();
  const taskId = createId("publish");
  const savedContents = await upsertManyPlatformContents(
    params.platformContents
  );
  const results: PublishResult[] = [];

  for (const pc of savedContents) {
    if (params.mode === "mock") {
      results.push({
        id: createId("result"),
        platform: pc.platform,
        platformContentId: pc.id,
        status: "success",
        url: `/mock/${pc.platform}/${pc.id}`
      });
      continue;
    }

    const capability = await getPublishCapability(pc.platform);
    if (capability?.assistSupported && !capability.realReady) {
      const response = await createAssistPublisher(pc.platform).publish({
        contentId: params.contentId,
        title: params.title,
        platformContent: pc,
        credentials: {},
        auth: {
          kind: "none",
          reason: capability.reasons[0] ?? "该平台当前走辅助发布"
        }
      });

      results.push({
        id: createId("result"),
        platform: response.platform,
        platformContentId: response.platformContentId,
        status: response.status,
        url: response.url,
        message: response.error ?? response.message
      });
      continue;
    }

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

    const auth = await getPublishAuth(pc.platform);
    const response = await publisher.publish({
      contentId: params.contentId,
      title: params.title,
      platformContent: pc,
      credentials: auth.kind === "manual" ? auth.credentials : {},
      auth
    });

    results.push({
      id: createId("result"),
      platform: response.platform,
      platformContentId: response.platformContentId,
      status: response.status,
      url: response.url,
      message: response.error ?? response.message
    });
  }

  const task: PublishTask = {
    id: taskId,
    contentId: params.contentId,
    title: params.title,
    mode: params.mode,
    status: aggregateStatus(results),
    results,
    createdAt: now,
    finishedAt: now
  };

  const store = await readStore();
  await writeStore({ ...store, publishTasks: [task, ...store.publishTasks] });

  return task;
}
