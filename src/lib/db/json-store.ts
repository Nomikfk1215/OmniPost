import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Content, PlatformContent, PublishTask } from "@/types";

type StoreShape = {
  contents: Content[];
  platformContents: PlatformContent[];
  publishTasks: PublishTask[];
};

const storeDir = path.join(process.cwd(), ".data");
const storePath = path.join(storeDir, "omnipost-store.json");

let cache: StoreShape | null = null;

const emptyStore: StoreShape = {
  contents: [],
  platformContents: [],
  publishTasks: []
};

async function ensureStore() {
  await mkdir(storeDir, { recursive: true });
}

export async function readStore(): Promise<StoreShape> {
  if (cache) {
    return cache;
  }

  await ensureStore();

  try {
    const file = await readFile(storePath, "utf8");
    cache = JSON.parse(file) as StoreShape;
    return cache;
  } catch {
    cache = emptyStore;
    await writeStore(cache);
    return cache;
  }
}

export async function writeStore(nextStore: StoreShape) {
  cache = nextStore;
  await ensureStore();
  await writeFile(storePath, JSON.stringify(nextStore, null, 2), "utf8");
}
