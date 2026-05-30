import {
  normalizePlatformAccounts,
  toPublicPlatformAccount
} from "@/lib/platform-accounts";
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

export async function listPlatformAccounts() {
  const store = await readStore();
  return normalizePlatformAccounts(store.platformAccounts).map(toPublicPlatformAccount);
}

export async function listStoredPlatformAccounts() {
  const store = await readStore();
  return normalizePlatformAccounts(store.platformAccounts);
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
