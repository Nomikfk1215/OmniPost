import {
  getDecryptedPlatformAccount,
  type DecryptedPlatformAccount
} from "@/lib/db/platform-accounts";
import { getDecryptedCredentials } from "@/lib/db/platform-credentials";
import type { Platform } from "@/types";

export type ManualPublishAuth = {
  kind: "manual";
  credentials: Record<string, string>;
};

export type OAuthPublishAuth = {
  kind: "oauth";
  account: DecryptedPlatformAccount;
};

export type MissingPublishAuth = {
  kind: "none";
  reason: string;
};

export type PlatformPublishAuth =
  | ManualPublishAuth
  | OAuthPublishAuth
  | MissingPublishAuth;

export function isTokenExpired(value: string | null, skewMs = 120_000) {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time - skewMs <= Date.now();
}

export async function getPublishAuth(
  platform: Platform
): Promise<PlatformPublishAuth> {
  if (platform === "wechat") {
    const credentials = await getDecryptedCredentials(platform);

    return credentials
      ? { kind: "manual", credentials }
      : {
          kind: "none",
          reason: "微信公众号需要先在设置页配置 AppID 和 AppSecret"
        };
  }

  if (platform === "bilibili" || platform === "xiaohongshu") {
    const account = await getDecryptedPlatformAccount(platform);

    if (!account) {
      return {
        kind: "none",
        reason:
          platform === "bilibili"
            ? "B站需要先在平台账号页完成 OAuth 连接"
            : "小红书需要先在平台账号页完成 OAuth 连接"
      };
    }

    if (isTokenExpired(account.tokenExpiresAt)) {
      return {
        kind: "none",
        reason:
          platform === "bilibili"
            ? "B站授权已过期，请重新连接账号"
            : "小红书授权已过期，请重新连接账号"
      };
    }

    return { kind: "oauth", account };
  }

  return {
    kind: "none",
    reason: "该平台当前没有可用于真实发布的官方授权方式"
  };
}
