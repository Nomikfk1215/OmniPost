import { deflateSync } from "node:zlib";

/**
 * WeChat Official Account API 客户端。
 * 纯 HTTP 封装，不依赖 OmniPost 类型，只处理微信 API 协议。
 *
 * 微信 API 文档: https://developers.weixin.qq.com/doc/offiaccount/
 */

// --- Token 缓存 ---

type TokenCacheEntry = {
  token: string;
  expiresAt: number; // epoch ms
};

const tokenCache = new Map<string, TokenCacheEntry>();
const TOKEN_BUFFER_MS = 120_000; // 提前 2 分钟刷新（token 有效期 7200s）
const defaultCoverMediaIdCache = new Map<string, string>();

// --- 类型定义 ---

export type WechatDraftArticle = {
  title: string;
  author?: string;
  digest?: string;
  content: string; // HTML
  content_source_url?: string;
  thumb_media_id?: string;
  show_cover_pic?: number;
  need_open_comment?: number;
  only_fans_can_comment?: number;
};

type WechatApiResponse = {
  errcode?: number;
  errmsg?: string;
  [key: string]: unknown;
};

// --- 默认封面图 ---

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type: string, data: Buffer) {
  const typeBuffer = Buffer.from(type, "ascii");
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function createDefaultCoverPng() {
  const width = 900;
  const height = 383;
  const raw = Buffer.alloc((width * 3 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0;

    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * 3;
      const wave = Math.round(20 * Math.sin((x + y) / 52));
      const highlight = x > 540 && y > 54 && y < 320 ? 24 : 0;
      raw[offset] = Math.min(255, 232 + highlight + wave);
      raw[offset + 1] = Math.min(255, 238 + highlight + Math.round(wave / 2));
      raw[offset + 2] = Math.min(255, 246 + highlight);
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createPngChunk("IHDR", ihdr),
    createPngChunk("IDAT", deflateSync(raw)),
    createPngChunk("IEND", Buffer.alloc(0))
  ]);
}

// --- HTTP 工具 ---

const WECHAT_API_BASE = "https://api.weixin.qq.com/cgi-bin";

async function wechatFetch<T extends WechatApiResponse>(
  url: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new Error(
      `微信 API 网络错误: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!response.ok) {
    throw new Error(`微信 API HTTP ${response.status}`);
  }

  const data = (await response.json()) as T;

  if (data.errcode && data.errcode !== 0) {
    throw new Error(
      `微信 API 错误 [${data.errcode}]: ${data.errmsg ?? "未知错误"}`
    );
  }

  return data;
}

// --- Token 管理 ---

async function fetchAccessToken(
  appId: string,
  appSecret: string
): Promise<{ token: string; expiresAt: number }> {
  const data = await wechatFetch<{
    errcode?: number;
    errmsg?: string;
    access_token?: string;
    expires_in?: number;
  }>(
    `${WECHAT_API_BASE}/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  );

  if (!data.access_token) {
    throw new Error(`获取 access_token 失败: ${data.errmsg ?? "未知错误"}`);
  }

  const expiresAt =
    Date.now() + (data.expires_in ?? 7200) * 1000 - TOKEN_BUFFER_MS;
  return { token: data.access_token, expiresAt };
}

export async function getAccessToken(
  appId: string,
  appSecret: string
): Promise<string> {
  const cached = tokenCache.get(appId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const { token, expiresAt } = await fetchAccessToken(appId, appSecret);
  tokenCache.set(appId, { token, expiresAt });
  return token;
}

/** 测试凭据是否有效：尝试获取 access_token */
export async function testCredentials(
  appId: string,
  appSecret: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await fetchAccessToken(appId, appSecret);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "连接测试失败"
    };
  }
}

// --- 素材上传 ---

/** 上传 Blob 图片作为永久素材，返回 media_id */
export async function uploadImageMaterial(
  accessToken: string,
  imageBlob: Blob,
  filename: string
): Promise<string> {
  const formData = new FormData();
  formData.append("media", imageBlob, filename);

  const data = await wechatFetch<{
    errcode?: number;
    errmsg?: string;
    media_id?: string;
  }>(
    `${WECHAT_API_BASE}/material/add_material?access_token=${accessToken}&type=image`,
    { method: "POST", body: formData }
  );

  if (!data.media_id) {
    throw new Error(`上传素材失败: ${data.errmsg ?? "未返回 media_id"}`);
  }

  return data.media_id;
}

/** 上传 OmniPost 默认封面图，返回可用于草稿 thumb_media_id 的永久素材 media_id */
export async function uploadDefaultCoverMaterial(
  accessToken: string
): Promise<string> {
  const cached = defaultCoverMediaIdCache.get(accessToken);
  if (cached) {
    return cached;
  }

  const bytes = createDefaultCoverPng();
  const blob = new Blob([new Uint8Array(bytes)], { type: "image/png" });
  const mediaId = await uploadImageMaterial(accessToken, blob, "omnipost-cover.png");
  defaultCoverMediaIdCache.set(accessToken, mediaId);
  return mediaId;
}

/** 从 URL 下载图片并上传为永久素材 */
export async function uploadImageFromUrl(
  accessToken: string,
  imageUrl: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn(`下载封面图失败: ${imageUrl} HTTP ${response.status}`);
      return null;
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") ?? "";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("gif")
        ? "gif"
        : "jpg";
    const filename = `cover.${ext}`;

    const formData = new FormData();
    formData.append("media", blob, filename);

    const data = await wechatFetch<{
      errcode?: number;
      errmsg?: string;
      media_id?: string;
    }>(
      `${WECHAT_API_BASE}/material/add_material?access_token=${accessToken}&type=image`,
      { method: "POST", body: formData }
    );

    if (!data.media_id) {
      throw new Error(`上传封面素材失败: ${data.errmsg ?? "未返回 media_id"}`);
    }

    return data.media_id;
  } catch (error) {
    console.warn(
      `上传封面图失败: ${imageUrl} — ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

// --- 草稿管理 ---

/** 创建草稿，返回 draft_media_id */
export async function createDraft(
  accessToken: string,
  article: WechatDraftArticle
): Promise<string> {
  const data = await wechatFetch<{
    errcode?: number;
    errmsg?: string;
    media_id?: string;
  }>(
    `${WECHAT_API_BASE}/draft/add?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articles: [article] })
    }
  );

  if (!data.media_id) {
    throw new Error(`创建草稿失败: ${data.errmsg ?? "未返回 media_id"}`);
  }

  return data.media_id;
}

// --- 发布 ---

/** 发布草稿，返回 publish_id */
export async function publishDraft(
  accessToken: string,
  mediaId: string
): Promise<string> {
  const data = await wechatFetch<{
    errcode?: number;
    errmsg?: string;
    publish_id?: string;
  }>(
    `${WECHAT_API_BASE}/freepublish/submit?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_id: mediaId })
    }
  );

  if (!data.publish_id) {
    throw new Error(`发布草稿失败: ${data.errmsg ?? "未返回 publish_id"}`);
  }

  return data.publish_id;
}

/** 获取已发布文章列表（获取文章 URL） */
export async function getPublishedArticleUrl(
  accessToken: string,
  publishId: string
): Promise<string | null> {
  try {
    const data = await wechatFetch<{
      errcode?: number;
      errmsg?: string;
      item?: Array<{
        article_id?: string;
        content?: {
          news_item?: Array<{ url?: string; title?: string }>;
        };
      }>;
      total_count?: number;
    }>(
      `${WECHAT_API_BASE}/freepublish/batchget?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offset: 0, count: 1, no_content: 0 })
      }
    );

    const url = data?.item?.[0]?.content?.news_item?.[0]?.url;
    return url ?? null;
  } catch (error) {
    console.warn(
      `获取已发布文章 URL 失败: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}
