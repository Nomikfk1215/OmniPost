import { createId } from "@/lib/utils";
import { collectContentImages } from "@/lib/images/assets";
import type { Content, ContentType } from "@/types";
import { readStore, writeStore } from "./json-store";

export async function createContent(input: {
  title?: string;
  contentType?: ContentType;
  rawText: string;
  images?: Array<Content["images"][number] | string>;
  userTags?: string[];
}) {
  const now = new Date().toISOString();
  const content: Content = {
    id: createId("content"),
    title: input.title,
    contentType: input.contentType,
    rawText: input.rawText,
    images: collectContentImages({
      rawText: input.rawText,
      images: input.images
    }),
    userTags: input.userTags ?? [],
    createdAt: now,
    updatedAt: now
  };
  const store = await readStore();
  await writeStore({ ...store, contents: [content, ...store.contents] });
  return content;
}

export async function updateContent(
  id: string,
  input: {
    title?: string;
    contentType?: ContentType;
    rawText?: string;
    images?: Array<Content["images"][number] | string>;
    userTags?: string[];
  }
) {
  const store = await readStore();
  const existing = store.contents.find((content) => content.id === id);

  if (!existing) {
    return null;
  }

  const rawText = input.rawText ?? existing.rawText;
  const imageInput = input.images ?? existing.images;
  const updated: Content = {
    ...existing,
    title: input.title ?? existing.title,
    contentType: input.contentType ?? existing.contentType,
    rawText,
    images: collectContentImages({
      rawText,
      images: imageInput
    }),
    userTags: input.userTags ?? existing.userTags ?? [],
    updatedAt: new Date().toISOString()
  };

  await writeStore({
    ...store,
    contents: store.contents.map((content) => (content.id === id ? updated : content))
  });

  return updated;
}

export async function getContentById(id: string) {
  const store = await readStore();
  return store.contents.find((content) => content.id === id) ?? null;
}
