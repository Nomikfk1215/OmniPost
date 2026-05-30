import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { readStore, writeStore } from "@/lib/db/json-store";
import type {
  CredentialPlatform,
  CredentialFieldDef,
  PublicPlatformCredential,
  StoredPlatformCredential,
  Platform
} from "@/types";

/**
 * 每个平台的凭据字段定义。
 * 新增平台只需在这里添加字段配置，UI 会自动渲染。
 */
export const CREDENTIAL_FIELDS: Record<
  CredentialPlatform,
  CredentialFieldDef[]
> = {
  wechat: [
    {
      key: "appId",
      label: "AppID",
      secret: false,
      placeholder: "wx..."
    },
    {
      key: "appSecret",
      label: "AppSecret",
      secret: true,
      placeholder: "公众号密钥"
    }
  ],
  zhihu: [],
  xiaohongshu: [],
  bilibili: []
};

export function getSupportedPlatforms(): Platform[] {
  return (Object.keys(CREDENTIAL_FIELDS) as Platform[]).filter(
    (p) => CREDENTIAL_FIELDS[p].length > 0
  );
}

// --- Store access ---

export async function getStoredCredential(
  platform: CredentialPlatform
): Promise<StoredPlatformCredential | null> {
  const store = await readStore();
  return (
    store.platformCredentials.find((c) => c.platform === platform) ?? null
  );
}

// --- Public view (masked secrets, safe for client) ---

function maskValue(value: string): string {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

export async function getPublicCredential(
  platform: CredentialPlatform
): Promise<PublicPlatformCredential> {
  const stored = await getStoredCredential(platform);
  const fields = CREDENTIAL_FIELDS[platform];

  if (!stored) {
    return {
      platform,
      configured: false,
      maskedFields: Object.fromEntries(
        fields.map((f) => [f.key, null])
      ),
      addedAt: "",
      updatedAt: ""
    };
  }

  const maskedFields: Record<string, string | null> = {};
  for (const field of fields) {
    const value = stored.credentials[field.key];
    if (!value) {
      maskedFields[field.key] = null;
    } else if (field.secret) {
      maskedFields[field.key] = "****";
    } else {
      maskedFields[field.key] = maskValue(value);
    }
  }

  return {
    platform,
    configured: true,
    maskedFields,
    addedAt: stored.addedAt,
    updatedAt: stored.updatedAt
  };
}

export async function getAllPublicCredentials(): Promise<
  PublicPlatformCredential[]
> {
  const platforms = Object.keys(CREDENTIAL_FIELDS) as Platform[];
  return Promise.all(platforms.map((p) => getPublicCredential(p as CredentialPlatform)));
}

// --- Save ---

export async function saveCredential(
  platform: CredentialPlatform,
  input: Record<string, string | undefined>
): Promise<StoredPlatformCredential> {
  const store = await readStore();
  const fields = CREDENTIAL_FIELDS[platform];
  const existing = store.platformCredentials.find(
    (c) => c.platform === platform
  );
  const now = new Date().toISOString();

  const credentials: Record<string, string | null> = {
    ...(existing?.credentials ?? {})
  };

  for (const field of fields) {
    const incoming = input[field.key];
    if (incoming === undefined) continue; // 未提供，保留现有值
    if (field.secret && incoming === "****") continue; // 掩码占位，保留加密值
    if (!incoming) {
      credentials[field.key] = null;
    } else if (field.secret) {
      credentials[field.key] = encryptSecret(incoming);
    } else {
      credentials[field.key] = incoming;
    }
  }

  const record: StoredPlatformCredential = {
    platform,
    credentials,
    addedAt: existing?.addedAt ?? now,
    updatedAt: now
  };

  const rest = store.platformCredentials.filter(
    (c) => c.platform !== platform
  );
  await writeStore({ ...store, platformCredentials: [...rest, record] });
  return record;
}

// --- Delete ---

export async function deleteCredential(
  platform: CredentialPlatform
): Promise<void> {
  const store = await readStore();
  await writeStore({
    ...store,
    platformCredentials: store.platformCredentials.filter(
      (c) => c.platform !== platform
    )
  });
}

// --- Decrypt for runtime use ---

function safeDecrypt(value: string | null): string | null {
  if (!value) return null;
  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

export async function getDecryptedCredentials(
  platform: CredentialPlatform
): Promise<Record<string, string> | null> {
  const stored = await getStoredCredential(platform);
  if (!stored) return null;

  const fields = CREDENTIAL_FIELDS[platform];
  const result: Record<string, string> = {};

  for (const field of fields) {
    const value = stored.credentials[field.key];
    if (!value) return null; // 凭据不完整
    if (field.secret) {
      const decrypted = safeDecrypt(value);
      if (!decrypted) return null; // 解密失败
      result[field.key] = decrypted;
    } else {
      result[field.key] = value;
    }
  }

  return result;
}
