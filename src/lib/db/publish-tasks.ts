import { createId } from "@/lib/utils";
import type { PlatformContent, PublishTask } from "@/types";
import { upsertManyPlatformContents } from "./platform-contents";
import { readStore, writeStore } from "./json-store";

export async function createMockPublishTask(params: {
  contentId: string;
  title: string;
  platformContents: PlatformContent[];
}) {
  const platformContents = await upsertManyPlatformContents(params.platformContents);
  const now = new Date().toISOString();
  const task: PublishTask = {
    id: createId("publish"),
    contentId: params.contentId,
    title: params.title,
    mode: "mock" as const,
    status: "success",
    results: platformContents.map((content) => ({
      id: createId("result"),
      platform: content.platform,
      platformContentId: content.id,
      status: "success",
      url: `/mock/${content.platform}/${content.id}`
    })),
    createdAt: now,
    finishedAt: now
  };

  const store = await readStore();
  await writeStore({ ...store, publishTasks: [task, ...store.publishTasks] });
  return task;
}

export async function listPublishTasks() {
  const store = await readStore();
  return store.publishTasks;
}

export async function getPublishTaskById(id: string) {
  const store = await readStore();
  return store.publishTasks.find((task) => task.id === id) ?? null;
}
