import {
  PLATFORMS,
  type Platform,
  type PlatformAccount,
  type PublishCapability,
  type StoredPlatformAccount
} from "@/types";

export const DEFAULT_PUBLISH_CAPABILITY: PublishCapability = "mock";

export const PUBLISH_CAPABILITY_INFOS: Record<
  PublishCapability,
  { label: string; description: string }
> = {
  real: {
    label: "可真实发布",
    description: "理论上可调用真实 API 发内容"
  },
  mock: {
    label: "模拟发布",
    description: "走 OmniPost 内部模拟发布流程"
  },
  assist: {
    label: "辅助发布",
    description: "仅做内容辅助，不直接发布"
  }
};

export function createDefaultPlatformAccount(platform: Platform): StoredPlatformAccount {
  return {
    platform,
    authorized: false,
    publishCapability: DEFAULT_PUBLISH_CAPABILITY,
    accountName: null,
    externalAccountId: null,
    connectionMethod: null,
    connectedAt: null,
    tokenExpiresAt: null,
    refreshTokenExpiresAt: null,
    scopes: [],
    lastConnectionError: null,
    encryptedAccessToken: null,
    encryptedRefreshToken: null
  };
}

export function createDefaultPlatformAccounts(): StoredPlatformAccount[] {
  return PLATFORMS.map(createDefaultPlatformAccount);
}

export function isPublishCapability(value: unknown): value is PublishCapability {
  return value === "real" || value === "mock" || value === "assist";
}

function asStringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function normalizePlatformAccounts(accounts: unknown): StoredPlatformAccount[] {
  const entries = Array.isArray(accounts) ? accounts : [];
  const byPlatform = new Map<Platform, Partial<StoredPlatformAccount>>();

  for (const entry of entries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const account = entry as Partial<StoredPlatformAccount>;

    if (PLATFORMS.includes(account.platform as Platform)) {
      byPlatform.set(account.platform as Platform, account);
    }
  }

  return PLATFORMS.map((platform) => {
    const account = byPlatform.get(platform);

    return {
      platform,
      authorized: Boolean(account?.authorized),
      publishCapability: isPublishCapability(account?.publishCapability)
        ? account.publishCapability
        : DEFAULT_PUBLISH_CAPABILITY,
      accountName: asStringOrNull(account?.accountName),
      externalAccountId: asStringOrNull(account?.externalAccountId),
      connectionMethod:
        account?.connectionMethod === "manual" || account?.connectionMethod === "oauth"
          ? account.connectionMethod
          : null,
      connectedAt: asStringOrNull(account?.connectedAt),
      tokenExpiresAt: asStringOrNull(account?.tokenExpiresAt),
      refreshTokenExpiresAt: asStringOrNull(account?.refreshTokenExpiresAt),
      scopes: asStringArray(account?.scopes),
      lastConnectionError: asStringOrNull(account?.lastConnectionError),
      oauthSupported: Boolean(account?.oauthSupported),
      oauthConfigured: Boolean(account?.oauthConfigured),
      oauthHint: asStringOrNull(account?.oauthHint) ?? undefined,
      encryptedAccessToken: asStringOrNull(account?.encryptedAccessToken),
      encryptedRefreshToken: asStringOrNull(account?.encryptedRefreshToken)
    };
  });
}

export function toPublicPlatformAccount(account: StoredPlatformAccount): PlatformAccount {
  const {
    encryptedAccessToken: _encryptedAccessToken,
    encryptedRefreshToken: _encryptedRefreshToken,
    ...publicAccount
  } = account;

  return publicAccount;
}
