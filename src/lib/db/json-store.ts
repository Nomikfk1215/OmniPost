import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createDefaultPlatformAccounts, normalizePlatformAccounts } from "@/lib/platform-accounts";
import type {
  Content,
  PlatformContent,
  PublishTask,
  StoredPlatformAccount,
  StoredLLMSettings,
  StoredPlatformCredential
} from "@/types";

type StoreShape = {
  contents: Content[];
  platformContents: PlatformContent[];
  publishTasks: PublishTask[];
  llmSettings: StoredLLMSettings | null;
  platformAccounts: StoredPlatformAccount[];
  platformCredentials: StoredPlatformCredential[];
};

const storeDir = path.join(process.cwd(), ".data");
const storePath = path.join(storeDir, "omnipost-store.json");

let cache: StoreShape | null = null;

function createEmptyStore(): StoreShape {
  return {
    contents: [],
    platformContents: [],
    publishTasks: [],
    llmSettings: null,
    platformAccounts: createDefaultPlatformAccounts(),
    platformCredentials: []
  };
}

function normalizeStore(store: Partial<StoreShape>): StoreShape {
  return {
    ...createEmptyStore(),
    ...store,
    platformAccounts: normalizePlatformAccounts(store.platformAccounts)
  };
}

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
    const parsed = JSON.parse(file) as Partial<StoreShape>;
    cache = normalizeStore(parsed);

    if (!parsed.platformAccounts) {
      await writeStore(cache);
    }

    return cache;
  } catch {
    cache = createEmptyStore();
    await writeStore(cache);
    return cache;
  }
}

export async function writeStore(nextStore: StoreShape) {
  cache = nextStore;
  await ensureStore();
  await writeFile(storePath, JSON.stringify(nextStore, null, 2), "utf8");
}
