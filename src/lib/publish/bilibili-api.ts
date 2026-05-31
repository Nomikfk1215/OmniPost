import crypto from "node:crypto";

const BILIBILI_MEMBER_BASE = "https://member.bilibili.com";
const SIGNATURE_METHOD = "HMAC-SHA256";
const SIGNATURE_VERSION = "2.0";

export type BilibiliApiAuth = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
};

export type BilibiliArticlePayload = {
  title: string;
  category: number;
  templateId: number;
  summary: string;
  content: string;
  bannerUrl?: string;
  original?: number;
  imageUrls?: string[];
  tags?: string[];
  listId?: number;
  upClosedReply?: number;
  topVideoBvid?: string;
};

type BilibiliApiResponse<T> = {
  code?: number;
  message?: string;
  request_id?: string;
  data?: T;
};

function md5(value: string | Buffer) {
  return crypto.createHash("md5").update(value).digest("hex");
}

function hmacSha256(secret: string, value: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function makeSignedHeaders(params: {
  auth: BilibiliApiAuth;
  bodyMd5: string;
  contentType?: string;
}) {
  const signableHeaders = {
    "x-bili-accesskeyid": params.auth.clientId,
    "x-bili-content-md5": params.bodyMd5,
    "x-bili-signature-method": SIGNATURE_METHOD,
    "x-bili-signature-nonce": crypto.randomUUID(),
    "x-bili-signature-version": SIGNATURE_VERSION,
    "x-bili-timestamp": Math.floor(Date.now() / 1000).toString()
  };
  const signatureSource = Object.entries(signableHeaders)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("\n");

  return {
    Accept: "application/json",
    ...(params.contentType ? { "Content-Type": params.contentType } : {}),
    "Access-Token": params.auth.accessToken,
    Authorization: hmacSha256(params.auth.clientSecret, signatureSource),
    "X-Bili-Accesskeyid": signableHeaders["x-bili-accesskeyid"],
    "X-Bili-Content-Md5": signableHeaders["x-bili-content-md5"],
    "X-Bili-Signature-Method": signableHeaders["x-bili-signature-method"],
    "X-Bili-Signature-Nonce": signableHeaders["x-bili-signature-nonce"],
    "X-Bili-Signature-Version": signableHeaders["x-bili-signature-version"],
    "X-Bili-Timestamp": signableHeaders["x-bili-timestamp"]
  };
}

async function parseBilibiliResponse<T>(response: Response) {
  let payload: BilibiliApiResponse<T>;

  try {
    payload = (await response.json()) as BilibiliApiResponse<T>;
  } catch {
    throw new Error(`B站 API HTTP ${response.status}`);
  }

  if (!response.ok || payload.code !== 0) {
    throw new Error(
      payload.message ?? `B站 API HTTP ${response.status}`
    );
  }

  if (!payload.data) {
    throw new Error("B站 API 未返回 data");
  }

  return payload.data;
}

function appendIfPresent(
  body: URLSearchParams,
  key: string,
  value: string | number | undefined
) {
  if (value === undefined || value === "") return;
  body.set(key, String(value));
}

function escapeMultipartValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function createMultipartBody(parts: Array<{
  name: string;
  value: string | Blob;
  filename?: string;
  contentType?: string;
}>) {
  const boundary = `----OmniPostBili${crypto.randomBytes(12).toString("hex")}`;
  const buffers: Buffer[] = [];

  for (const part of parts) {
    const disposition = [
      `form-data; name="${escapeMultipartValue(part.name)}"`,
      part.filename
        ? `filename="${escapeMultipartValue(part.filename)}"`
        : null
    ]
      .filter(Boolean)
      .join("; ");

    buffers.push(
      Buffer.from(`--${boundary}\r\nContent-Disposition: ${disposition}\r\n`)
    );

    if (part.value instanceof Blob) {
      buffers.push(
        Buffer.from(
          `Content-Type: ${part.contentType ?? part.value.type ?? "application/octet-stream"}\r\n\r\n`
        )
      );
      buffers.push(Buffer.from(await part.value.arrayBuffer()));
    } else {
      buffers.push(Buffer.from("\r\n"));
      buffers.push(Buffer.from(part.value));
    }

    buffers.push(Buffer.from("\r\n"));
  }

  buffers.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    body: Buffer.concat(buffers),
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

export async function submitBilibiliArticle(
  auth: BilibiliApiAuth,
  payload: BilibiliArticlePayload
) {
  const body = new URLSearchParams();
  body.set("title", payload.title);
  body.set("category", String(payload.category));
  body.set("template_id", String(payload.templateId));
  body.set("summary", payload.summary);
  body.set("content", payload.content);
  appendIfPresent(body, "banner_url", payload.bannerUrl);
  appendIfPresent(body, "original", payload.original);
  appendIfPresent(body, "image_urls", payload.imageUrls?.join(","));
  appendIfPresent(body, "tags", payload.tags?.join(","));
  appendIfPresent(body, "list_id", payload.listId);
  appendIfPresent(body, "up_closed_reply", payload.upClosedReply);
  appendIfPresent(body, "top_video_bvid", payload.topVideoBvid);

  const multipart = await createMultipartBody(
    Array.from(body.entries()).map(([name, value]) => ({ name, value }))
  );
  const response = await fetch(
    `${BILIBILI_MEMBER_BASE}/arcopen/fn/article/add`,
    {
      method: "POST",
      headers: makeSignedHeaders({
        auth,
        bodyMd5: md5(multipart.body),
        contentType: multipart.contentType
      }),
      body: multipart.body
    }
  );

  return parseBilibiliResponse<{ id: number }>(response);
}

export async function uploadBilibiliArticleImage(params: {
  auth: BilibiliApiAuth;
  image: Blob;
  filename: string;
  watermark?: boolean;
}) {
  const multipart = await createMultipartBody([
    {
      name: "file",
      value: params.image,
      filename: params.filename,
      contentType: params.image.type || "application/octet-stream"
    },
    {
      name: "watermark",
      value: params.watermark ? "true" : "false"
    }
  ]);

  const response = await fetch(
    `${BILIBILI_MEMBER_BASE}/arcopen/fn/article/upload/image`,
    {
      method: "POST",
      headers: makeSignedHeaders({
        auth: params.auth,
        bodyMd5: md5(multipart.body),
        contentType: multipart.contentType
      }),
      body: multipart.body
    }
  );

  return parseBilibiliResponse<{ url: string; size?: number }>(response);
}
