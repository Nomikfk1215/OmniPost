import {
  normalizePlatformAccounts,
  toPublicPlatformAccount
} from "@/lib/platform-accounts";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import type {
  Platform,
  PlatformAccount,
  PublishCapability,
  StoredPlatformAccount
} from "@/types";
import { readStore, writeStore } from "./json-store";

export type UpdatePlatformAccountInput = {
  authorized?: boolean;
  publishCapability?: PublishCapability;
};

export type ConnectPlatformAccountInput = {
  accountName: string;
  externalAccountId: string | null;
  encryptedAccessToken: string;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scopes: string[];
};

export type DecryptedPlatformAccount = {
  platform: Platform;
  accountName: string | null;
  externalAccountId: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scopes: string[];
};

export async function listPlatformAccounts() {
  const store = await readStore();
  return normalizePlatformAccounts(store.platformAccounts).map(toPublicPlatformAccount);
}

export async function listStoredPlatformAccounts() {
  const store = await readStore();
  return normalizePlatformAccounts(store.platformAccounts);
}

export async function getStoredPlatformAccount(platform: Platform) {
  const accounts = await listStoredPlatformAccounts();
  return accounts.find((account) => account.platform === platform) ?? null;
}

export async function updatePlatformAccount(
  platform: Platform,
  input: UpdatePlatformAccountInput
): Promise<PlatformAccount> {
  const store = await readStore();
  const accounts = normalizePlatformAccounts(store.platformAccounts);
  let nextAccount: StoredPlatformAccount | null = null;

  const nextAccounts = accounts.map((account) => {
    if (account.platform !== platform) {
      return account;
    }

    const authorized = input.authorized ?? account.authorized;

    nextAccount = {
      ...account,
      authorized,
      publishCapability: input.publishCapability ?? account.publishCapability,
      connectionMethod: authorized
        ? account.connectionMethod ?? "manual"
        : null,
      connectedAt: authorized
        ? account.connectedAt ?? new Date().toISOString()
        : null,
      accountName: authorized ? account.accountName : null,
      externalAccountId: authorized ? account.externalAccountId : null,
      tokenExpiresAt: authorized ? account.tokenExpiresAt : null,
      refreshTokenExpiresAt: authorized ? account.refreshTokenExpiresAt : null,
      scopes: authorized ? account.scopes : [],
      lastConnectionError: authorized ? account.lastConnectionError : null,
      encryptedAccessToken: authorized ? account.encryptedAccessToken : null,
      encryptedRefreshToken: authorized ? account.encryptedRefreshToken : null
    };

    return nextAccount;
  });

  await writeStore({ ...store, platformAccounts: nextAccounts });

  if (!nextAccount) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  return toPublicPlatformAccount(nextAccount);
}

export async function connectPlatformAccount(
  platform: Platform,
  input: ConnectPlatformAccountInput
): Promise<PlatformAccount> {
  const store = await readStore();
  const accounts = normalizePlatformAccounts(store.platformAccounts);
  let nextAccount: StoredPlatformAccount | null = null;
  const now = new Date().toISOString();

  const nextAccounts = accounts.map((account) => {
    if (account.platform !== platform) {
      return account;
    }

    nextAccount = {
      ...account,
      authorized: true,
      publishCapability: account.publishCapability,
      accountName: input.accountName,
      externalAccountId: input.externalAccountId,
      connectionMethod: "oauth",
      connectedAt: now,
      tokenExpiresAt: input.tokenExpiresAt,
      refreshTokenExpiresAt: input.refreshTokenExpiresAt,
      scopes: input.scopes,
      lastConnectionError: null,
      encryptedAccessToken: input.encryptedAccessToken,
      encryptedRefreshToken: input.encryptedRefreshToken
    };

    return nextAccount;
  });

  await writeStore({ ...store, platformAccounts: nextAccounts });

  if (!nextAccount) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  return toPublicPlatformAccount(nextAccount);
}

function safeDecrypt(value: string | null) {
  if (!value) return null;

  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

export async function getDecryptedPlatformAccount(
  platform: Platform
): Promise<DecryptedPlatformAccount | null> {
  const account = await getStoredPlatformAccount(platform);

  if (!account?.authorized || !account.encryptedAccessToken) {
    return null;
  }

  const accessToken = safeDecrypt(account.encryptedAccessToken);

  if (!accessToken) {
    return null;
  }

  return {
    platform,
    accountName: account.accountName,
    externalAccountId: account.externalAccountId,
    accessToken,
    refreshToken: safeDecrypt(account.encryptedRefreshToken),
    tokenExpiresAt: account.tokenExpiresAt,
    refreshTokenExpiresAt: account.refreshTokenExpiresAt,
    scopes: account.scopes
  };
}

export async function updatePlatformOAuthTokens(
  platform: Platform,
  input: {
    accessToken: string;
    refreshToken?: string | null;
    tokenExpiresAt?: string | null;
    refreshTokenExpiresAt?: string | null;
    scopes?: string[];
  }
) {
  const store = await readStore();
  const accounts = normalizePlatformAccounts(store.platformAccounts);
  const nextAccounts = accounts.map((account) =>
    account.platform === platform
      ? {
          ...account,
          authorized: true,
          connectionMethod: "oauth" as const,
          encryptedAccessToken: encryptSecret(input.accessToken),
          encryptedRefreshToken: input.refreshToken
            ? encryptSecret(input.refreshToken)
            : account.encryptedRefreshToken,
          tokenExpiresAt: input.tokenExpiresAt ?? account.tokenExpiresAt,
          refreshTokenExpiresAt:
            input.refreshTokenExpiresAt ?? account.refreshTokenExpiresAt,
          scopes: input.scopes ?? account.scopes,
          lastConnectionError: null
        }
      : account
  );

  await writeStore({ ...store, platformAccounts: nextAccounts });
}

export async function markPlatformConnectionError(platform: Platform, message: string) {
  const store = await readStore();
  const accounts = normalizePlatformAccounts(store.platformAccounts);
  const nextAccounts = accounts.map((account) =>
    account.platform === platform
      ? { ...account, lastConnectionError: message }
      : account
  );

  await writeStore({ ...store, platformAccounts: nextAccounts });
}
