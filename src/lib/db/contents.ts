import { createId } from "@/lib/utils";
import type { Content } from "@/types";
import { readStore, writeStore } from "./json-store";

export async function createContent(input: {
  title?: string;
  rawText: string;
  images?: string[];
  userTags?: string[];
}) {
  const now = new Date().toISOString();
  const content: Content = {
    id: createId("content"),
    title: input.title,
    rawText: input.rawText,
    images: input.images ?? [],
    userTags: input.userTags ?? [],
    createdAt: now,
    updatedAt: now
  };
  const store = await readStore();
  await writeStore({ ...store, contents: [content, ...store.contents] });
  return content;
}

export async function getContentById(id: string) {
  const store = await readStore();
  return store.contents.find((content) => content.id === id) ?? null;
}
