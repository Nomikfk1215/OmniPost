import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DEFAULT_LLM_BASE_URL,
  DEFAULT_LLM_MODEL,
  getDecryptedStoredApiKey,
  getRuntimeLLMConfig,
  isMaskedApiKey,
  updateLLMConnectionStatus
} from "@/lib/llm/settings-store";

export const runtime = "nodejs";

const testSchema = z.object({
  apiKey: z.string().optional(),
  baseUrl: z.string().trim().url().optional(),
  model: z.string().trim().min(1).optional()
});

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

async function resolveTestConfig(input: z.infer<typeof testSchema>) {
  const storedApiKey = await getDecryptedStoredApiKey();
  const runtimeConfig = await getRuntimeLLMConfig();
  const hasInputKey = input.apiKey !== undefined;
  const trimmedInputKey = input.apiKey?.trim() ?? "";
  const apiKey = hasInputKey && !isMaskedApiKey(trimmedInputKey)
    ? trimmedInputKey || null
    : storedApiKey ?? runtimeConfig?.apiKey ?? null;

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    baseUrl: normalizeBaseUrl(input.baseUrl ?? runtimeConfig?.baseUrl ?? DEFAULT_LLM_BASE_URL),
    model: input.model?.trim() ?? runtimeConfig?.model ?? DEFAULT_LLM_MODEL,
    shouldPersistStatus: !hasInputKey || isMaskedApiKey(trimmedInputKey)
  };
}

async function readSafeError(response: Response) {
  try {
    const text = await response.text();
    return text.replace(/\s+/g, " ").slice(0, 180);
  } catch {
    return "";
  }
}

function makeNonJsonMessage(raw: string) {
  const snippet = raw.replace(/\s+/g, " ").trim().slice(0, 180);
  return `接口返回的不是 OpenAI 兼容 JSON，请检查 API 地址是否正确（通常需要以 /v1 结尾）${snippet ? `：${snippet}` : ""}`;
}

function makeInvalidSchemaMessage(raw: string) {
  const snippet = raw.replace(/\s+/g, " ").trim().slice(0, 180);
  return `接口返回缺少 choices/message 字段，请确认模型和接口兼容 OpenAI Chat Completions${snippet ? `：${snippet}` : ""}`;
}

export async function POST(request: Request) {
  const payload = testSchema.safeParse(await request.json().catch(() => ({})));

  if (!payload.success) {
    return NextResponse.json({ error: "测试参数格式不正确" }, { status: 400 });
  }

  const config = await resolveTestConfig(payload.data);

  if (!config) {
    return NextResponse.json({ error: "请先配置 API Key" }, { status: 400 });
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1
      }),
      signal: controller.signal
    });
    const testedAt = new Date().toISOString();
    const latencyMs = Date.now() - startedAt;

    if (!response.ok) {
      const message = `HTTP ${response.status} ${await readSafeError(response)}`.trim();

      if (config.shouldPersistStatus) {
        await updateLLMConnectionStatus({ ok: false, testedAt, error: message });
      }

      return NextResponse.json({ ok: false, latencyMs, testedAt, error: message }, { status: 502 });
    }

    const raw = await response.text();
    let responseJson: {
      choices?: Array<{ message?: { content?: string } }>;
    };

    try {
      responseJson = JSON.parse(raw) as typeof responseJson;
    } catch {
      const message = makeNonJsonMessage(raw);

      if (config.shouldPersistStatus) {
        await updateLLMConnectionStatus({ ok: false, testedAt, error: message });
      }

      return NextResponse.json({ ok: false, latencyMs, testedAt, error: message }, { status: 502 });
    }

    if (!Array.isArray(responseJson.choices) || !responseJson.choices[0]?.message) {
      const message = makeInvalidSchemaMessage(raw);

      if (config.shouldPersistStatus) {
        await updateLLMConnectionStatus({ ok: false, testedAt, error: message });
      }

      return NextResponse.json({ ok: false, latencyMs, testedAt, error: message }, { status: 502 });
    }

    if (config.shouldPersistStatus) {
      await updateLLMConnectionStatus({ ok: true, testedAt });
    }

    return NextResponse.json({ ok: true, latencyMs, testedAt });
  } catch (error) {
    const testedAt = new Date().toISOString();
    const message = error instanceof Error && error.name === "AbortError"
      ? "连接超时"
      : error instanceof Error
        ? error.message
        : "连接测试失败";

    if (config.shouldPersistStatus) {
      await updateLLMConnectionStatus({ ok: false, testedAt, error: message });
    }

    return NextResponse.json(
      { ok: false, latencyMs: Date.now() - startedAt, testedAt, error: message },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
