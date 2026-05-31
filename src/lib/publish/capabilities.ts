// Ensure publisher registration has happened before reading the registry.
import "./init";

import { listPlatformAccounts } from "@/lib/db/platform-accounts";
import { getPublicCredential } from "@/lib/db/platform-credentials";
import { getPublisher } from "@/lib/publish/registry";
import type {
  Platform,
  PlatformAccount,
  PlatformPublishCapability,
  PlatformPublishMode
} from "@/types";
import { PLATFORMS } from "@/types";

const REAL_SUPPORTED_PLATFORMS = new Set<Platform>(["wechat", "bilibili"]);
const ASSIST_SUPPORTED_PLATFORMS = new Set<Platform>([
  "zhihu",
  "xiaohongshu",
  "bilibili"
]);
const BILIBILI_ARTICLE_SCOPE = "ATC_BASE";

function accountRecord(accounts: PlatformAccount[]) {
  return accounts.reduce(
    (result, account) => ({ ...result, [account.platform]: account }),
    {} as Record<Platform, PlatformAccount>
  );
}

function preferredMode(params: {
  realSupported: boolean;
  realReady: boolean;
  assistSupported: boolean;
}): PlatformPublishMode {
  if (params.realReady) return "real";
  if (params.assistSupported) return "assist";
  if (params.realSupported) return "unavailable";
  return "mock";
}

function tokenExpired(value: string | null, skewMs = 120_000) {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time - skewMs <= Date.now();
}

export async function listPublishCapabilities(): Promise<
  PlatformPublishCapability[]
> {
  const accounts = accountRecord(await listPlatformAccounts());
  const wechatCredential = await getPublicCredential("wechat");
  const bilibiliClientConfigured = Boolean(
    process.env.OMNIPOST_BILIBILI_CLIENT_ID?.trim() &&
      process.env.OMNIPOST_BILIBILI_CLIENT_SECRET?.trim()
  );

  return PLATFORMS.map((platform) => {
    const account = accounts[platform];
    const hasPublisher = Boolean(getPublisher(platform));
    const realSupported = REAL_SUPPORTED_PLATFORMS.has(platform);
    const assistSupported = ASSIST_SUPPORTED_PLATFORMS.has(platform);
    const reasons: string[] = [];
    let realReady = false;
    let authMethod: PlatformPublishCapability["authMethod"] = null;

    if (platform === "wechat") {
      authMethod = "credential";
      realReady = hasPublisher && wechatCredential.configured;

      if (!wechatCredential.configured) {
        reasons.push("微信公众号缺少 AppID/AppSecret");
      }
    } else if (platform === "bilibili") {
      authMethod = "oauth";
      realReady =
        hasPublisher &&
        bilibiliClientConfigured &&
        account.authorized &&
        Boolean(account.connectedAt);

      if (!bilibiliClientConfigured) {
        reasons.push("B站未配置开放平台 Client ID/Client Secret，当前走辅助发布");
      }

      if (!account.authorized) {
        reasons.push("B站账号未连接，当前走辅助发布");
      }

      if (account.authorized && tokenExpired(account.tokenExpiresAt)) {
        realReady = false;
        reasons.push("B站授权已过期，请重新连接账号");
      }

      if (
        realReady &&
        account.scopes.length > 0 &&
        !account.scopes.includes(BILIBILI_ARTICLE_SCOPE)
      ) {
        realReady = false;
        reasons.push(`B站授权缺少 ${BILIBILI_ARTICLE_SCOPE} 专栏投稿权限`);
      }
    } else if (platform === "xiaohongshu") {
      authMethod = account.authorized ? "oauth" : null;
      reasons.push("小红书官方笔记发布 API 需要平台权限确认，当前走辅助发布");
    } else {
      reasons.push("知乎当前未开放稳定的官方创作者发文 API，当前走辅助发布");
    }

    if (realSupported && !hasPublisher) {
      realReady = false;
      reasons.push("后端缺少真实发布器");
    }

    return {
      platform,
      hasPublisher,
      realSupported,
      realReady,
      assistSupported,
      preferredMode: preferredMode({
        realSupported,
        realReady,
        assistSupported
      }),
      authMethod,
      accountName: account.accountName,
      scopes: account.scopes,
      reasons
    };
  });
}

export async function getPublishCapability(platform: Platform) {
  const capabilities = await listPublishCapabilities();
  return capabilities.find((item) => item.platform === platform) ?? null;
}
