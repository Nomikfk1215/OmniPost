import { validatePlatformContent } from "@/lib/validators";
import type { PlatformContent } from "@/types";
import { readStore, writeStore } from "./json-store";

export async function upsertPlatformContent(content: PlatformContent) {
  const store = await readStore();
  const updated = {
    ...content,
    validation: validatePlatformContent(content),
    updatedAt: new Date().toISOString()
  };
  const rest = store.platformContents.filter((item) => item.id !== content.id);
  await writeStore({ ...store, platformContents: [updated, ...rest] });
  return updated;
}

export async function upsertManyPlatformContents(contents: PlatformContent[]) {
  const store = await readStore();
  const ids = new Set(contents.map((item) => item.id));
  const nextContents = contents.map((item) => ({
    ...item,
    validation: validatePlatformContent(item),
    updatedAt: new Date().toISOString()
  }));
  const rest = store.platformContents.filter((item) => !ids.has(item.id));
  await writeStore({ ...store, platformContents: [...nextContents, ...rest] });
  return nextContents;
}

export async function getPlatformContentById(id: string) {
  const store = await readStore();
  return store.platformContents.find((content) => content.id === id) ?? null;
}

export async function listPlatformContentsByContentId(contentId: string) {
  const store = await readStore();
  return store.platformContents.filter((content) => content.contentId === contentId);
}
