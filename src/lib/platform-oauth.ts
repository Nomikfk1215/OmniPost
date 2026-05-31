import crypto from "node:crypto";
import { encryptSecret } from "@/lib/crypto";
import type { Platform } from "@/types";

type OAuthPlatform = Extract<Platform, "bilibili" | "xiaohongshu">;

type OAuthProviderStatus = {
  supported: boolean;
  configured: boolean;
  hint: string;
};

type OAuthConnectionResult = {
  accountName: string;
  externalAccountId: string | null;
  encryptedAccessToken: string;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scopes: string[];
};

const OAUTH_PLATFORMS: OAuthPlatform[] = ["bilibili", "xiaohongshu"];
const STATE_TTL_MS = 10 * 60 * 1000;

function getStateSecret() {
  return process.env.OMNIPOST_OAUTH_STATE_SECRET
    ?? process.env.OMNIPOST_ENCRYPTION_KEY
    ?? "omnipost-local-oauth-state-secret";
}

function sign(value: string) {
  return crypto.createHmac("sha256", getStateSecret()).update(value).digest("base64url");
}

function md5(value: string) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function hmacSha256(secret: string, value: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function isOAuthPlatform(platform: Platform): platform is OAuthPlatform {
  return OAUTH_PLATFORMS.includes(platform as OAuthPlatform);
}

function getBilibiliConfig() {
  const clientId = process.env.OMNIPOST_BILIBILI_CLIENT_ID?.trim();
  const clientSecret = process.env.OMNIPOST_BILIBILI_CLIENT_SECRET?.trim();

  return {
    clientId,
    clientSecret,
    configured: Boolean(clientId && clientSecret)
  };
}

function getXiaohongshuConfig() {
  const appId = process.env.OMNIPOST_XIAOHONGSHU_APP_ID?.trim();
  const appSecret = process.env.OMNIPOST_XIAOHONGSHU_APP_SECRET?.trim();

  return {
    appId,
    appSecret,
    configured: Boolean(appId && appSecret)
  };
}

export function getOAuthProviderStatus(platform: Platform): OAuthProviderStatus {
  if (!isOAuthPlatform(platform)) {
    return {
      supported: false,
      configured: false,
      hint:
        platform === "wechat"
          ? "微信公众号真实连接需要微信开放平台第三方平台授权流程。"
          : "知乎暂未接入公开创作者 OAuth。"
    };
  }

  if (platform === "bilibili") {
    const config = getBilibiliConfig();

    return {
      supported: true,
      configured: config.configured,
      hint: config.configured
        ? "已配置 B站开放平台凭证。"
        : "需要配置 OMNIPOST_BILIBILI_CLIENT_ID 和 OMNIPOST_BILIBILI_CLIENT_SECRET。"
    };
  }

  const config = getXiaohongshuConfig();

  return {
    supported: true,
    configured: config.configured,
    hint: config.configured
      ? "已配置小红书开放平台凭证。"
      : "需要配置 OMNIPOST_XIAOHONGSHU_APP_ID 和 OMNIPOST_XIAOHONGSHU_APP_SECRET。"
  };
}

export function enrichOAuthStatus<T extends { platform: Platform }>(account: T) {
  const status = getOAuthProviderStatus(account.platform);

  return {
    ...account,
    oauthSupported: status.supported,
    oauthConfigured: status.configured,
    oauthHint: status.hint
  };
}

function createOAuthState(platform: OAuthPlatform) {
  const payload = Buffer.from(
    JSON.stringify({
      platform,
      issuedAt: Date.now(),
      nonce: crypto.randomUUID()
    }),
    "utf8"
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function verifyOAuthState(platform: OAuthPlatform, state: string | null) {
  if (!state) {
    throw new Error("授权回调缺少 state");
  }

  const [payload, signature] = state.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    throw new Error("授权 state 校验失败");
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    platform?: string;
    issuedAt?: number;
  };

  if (parsed.platform !== platform) {
    throw new Error("授权平台不匹配");
  }

  if (!parsed.issuedAt || Date.now() - parsed.issuedAt > STATE_TTL_MS) {
    throw new Error("授权 state 已过期，请重新连接");
  }
}

export function buildOAuthConnectUrl(platform: Platform, requestUrl: string) {
  if (!isOAuthPlatform(platform)) {
    throw new Error(getOAuthProviderStatus(platform).hint);
  }

  const status = getOAuthProviderStatus(platform);

  if (!status.configured) {
    throw new Error(status.hint);
  }

  const callbackUrl = new URL(`/api/accounts/${platform}/callback`, requestUrl).toString();
  const state = createOAuthState(platform);

  if (platform === "bilibili") {
    const { clientId } = getBilibiliConfig();
    const url = new URL("https://account.bilibili.com/pc/account-pc/auth/oauth");
    url.searchParams.set("client_id", clientId ?? "");
    url.searchParams.set("gourl", callbackUrl);
    url.searchParams.set("state", state);
    return url.toString();
  }

  const { appId } = getXiaohongshuConfig();
  const url = new URL("https://ark.xiaohongshu.com/ark/authorization");
  url.searchParams.set("appId", appId ?? "");
  url.searchParams.set("redirectUri", callbackUrl);
  url.searchParams.set("state", state);
  return url.toString();
}

function toIsoFromSeconds(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function toIsoFromMilliseconds(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return new Date(value).toISOString();
}

async function completeBilibiliOAuth(code: string): Promise<OAuthConnectionResult> {
  const { clientId, clientSecret } = getBilibiliConfig();

  if (!clientId || !clientSecret) {
    throw new Error(getOAuthProviderStatus("bilibili").hint);
  }

  const tokenUrl = new URL("https://api.bilibili.com/x/account-oauth2/v1/token");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("code", code);

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  const tokenPayload = await tokenResponse.json() as {
    code?: number;
    message?: string;
    data?: {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      scopes?: string[];
    };
  };

  if (!tokenResponse.ok || tokenPayload.code !== 0 || !tokenPayload.data?.access_token) {
    throw new Error(tokenPayload.message ?? "B站授权码换取 access_token 失败");
  }

  const body = "";
  const headersToSign = {
    "x-bili-accesskeyid": clientId,
    "x-bili-content-md5": md5(body),
    "x-bili-signature-method": "HMAC-SHA256",
    "x-bili-signature-nonce": crypto.randomUUID(),
    "x-bili-signature-version": "2.0",
    "x-bili-timestamp": Math.floor(Date.now() / 1000).toString()
  };
  const signatureSource = Object.entries(headersToSign)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("\n");
  const userResponse = await fetch(
    "https://member.bilibili.com/arcopen/fn/user/account/info",
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Token": tokenPayload.data.access_token,
        Authorization: hmacSha256(clientSecret, signatureSource),
        "X-Bili-Accesskeyid": headersToSign["x-bili-accesskeyid"],
        "X-Bili-Content-Md5": headersToSign["x-bili-content-md5"],
        "X-Bili-Signature-Method": headersToSign["x-bili-signature-method"],
        "X-Bili-Signature-Nonce": headersToSign["x-bili-signature-nonce"],
        "X-Bili-Signature-Version": headersToSign["x-bili-signature-version"],
        "X-Bili-Timestamp": headersToSign["x-bili-timestamp"]
      }
    }
  );
  const userPayload = await userResponse.json() as {
    code?: number;
    message?: string;
    data?: {
      name?: string;
      openid?: string;
    };
  };

  if (!userResponse.ok || userPayload.code !== 0 || !userPayload.data?.name) {
    throw new Error(userPayload.message ?? "B站用户信息获取失败，请确认应用已申请 USER_INFO 权限");
  }

  return {
    accountName: userPayload.data.name,
    externalAccountId: userPayload.data.openid ?? null,
    encryptedAccessToken: encryptSecret(tokenPayload.data.access_token),
    encryptedRefreshToken: tokenPayload.data.refresh_token
      ? encryptSecret(tokenPayload.data.refresh_token)
      : null,
    tokenExpiresAt: toIsoFromSeconds(tokenPayload.data.expires_in),
    refreshTokenExpiresAt: null,
    scopes: tokenPayload.data.scopes ?? []
  };
}

async function completeXiaohongshuOAuth(code: string): Promise<OAuthConnectionResult> {
  const { appId, appSecret } = getXiaohongshuConfig();

  if (!appId || !appSecret) {
    throw new Error(getOAuthProviderStatus("xiaohongshu").hint);
  }

  const timestamp = Date.now().toString();
  const version = "2.0";
  const method = "oauth.getAccessToken";
  const signatureSource = `${method}?appId=${appId}&timestamp=${timestamp}&version=${version}${appSecret}`;
  const response = await fetch("https://ark.xiaohongshu.com/ark/open_api/v3/common_controller", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sign: md5(signatureSource),
      appId,
      timestamp,
      version,
      method,
      code
    })
  });
  const payload = await response.json() as {
    success?: boolean;
    error_msg?: string;
    msg?: string;
    data?: {
      accessToken?: string;
      refreshToken?: string;
      accessTokenExpiresAt?: number;
      refreshTokenExpiresAt?: number;
      sellerId?: string | number;
      sellerName?: string;
    };
  };

  if (!response.ok || !payload.success || !payload.data?.accessToken || !payload.data?.sellerName) {
    throw new Error(payload.error_msg ?? payload.msg ?? "小红书授权码换取 access_token 失败");
  }

  return {
    accountName: payload.data.sellerName,
    externalAccountId:
      payload.data.sellerId === undefined ? null : String(payload.data.sellerId),
    encryptedAccessToken: encryptSecret(payload.data.accessToken),
    encryptedRefreshToken: payload.data.refreshToken
      ? encryptSecret(payload.data.refreshToken)
      : null,
    tokenExpiresAt: toIsoFromMilliseconds(payload.data.accessTokenExpiresAt),
    refreshTokenExpiresAt: toIsoFromMilliseconds(payload.data.refreshTokenExpiresAt),
    scopes: []
  };
}

export async function completeOAuthCallback(
  platform: Platform,
  code: string | null,
  state: string | null
) {
  if (!isOAuthPlatform(platform)) {
    throw new Error(getOAuthProviderStatus(platform).hint);
  }

  if (!code) {
    throw new Error("授权回调缺少 code");
  }

  verifyOAuthState(platform, state);

  if (platform === "bilibili") {
    return completeBilibiliOAuth(code);
  }

  return completeXiaohongshuOAuth(code);
}
