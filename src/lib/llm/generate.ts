import { buildPrompt } from "@/lib/prompts/builder";
import { loadStylePreset } from "@/lib/presets";
import { createId } from "@/lib/utils";
import { getRuntimeLLMConfig, type RuntimeLLMConfig } from "@/lib/llm/settings-store";
import { enrichPlatformImages } from "@/lib/images/planning";
import {
  contentBriefSchema,
  platformOutputSchemas,
  type ContentBrief
} from "@/lib/llm/schemas";
import { validatePlatformContent } from "@/lib/validators";
import type { Content, Platform, PlatformContent, StylePreset } from "@/types";
import type { ZodTypeAny } from "zod";

export class LLMGenerationError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "LLMGenerationError";
    this.status = status;
  }
}

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

async function readSafeError(response: Response) {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return "";
  }
}

function compactText(value: string, max = 180) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

async function readJsonResponse(response: Response, context: string) {
  const raw = await response.text();

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    const snippet = compactText(raw);
    throw new LLMGenerationError(
      `${context}失败：AI 接口返回的不是 JSON，请检查 API 地址是否为 OpenAI 兼容地址（通常需要以 /v1 结尾）${snippet ? `。返回片段：${snippet}` : ""}`,
      502
    );
  }
}

function extractJsonText(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

async function callChatJson(
  config: RuntimeLLMConfig,
  messages: ChatMessage[],
  schema: ZodTypeAny,
  context: string
): Promise<unknown> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      max_tokens: 12000,
      temperature: 0.3,
      messages
    })
  });

  if (!response.ok) {
    const detail = await readSafeError(response);
    throw new LLMGenerationError(
      `${context}失败：HTTP ${response.status}${detail ? ` ${detail}` : ""}`,
      502
    );
  }

  const payload = (await readJsonResponse(response, context)) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = payload.choices?.[0]?.message?.content;

  if (!raw) {
    throw new LLMGenerationError(`${context}失败：模型没有返回 message.content`, 502);
  }

  const parsedJson = await parseOrRepairJson(config, raw, context);

  const parsed = schema.safeParse(parsedJson);

  if (!parsed.success) {
    const issueText = parsed.error.issues
      .slice(0, 3)
      .map((issue) => `${issue.path.join(".") || "root"} ${issue.message}`)
      .join("；");
    throw new LLMGenerationError(`${context}失败：模型返回字段不符合要求${issueText ? `（${issueText}）` : ""}`, 502);
  }

  return parsed.data;
}

async function parseOrRepairJson(
  config: RuntimeLLMConfig,
  raw: string,
  context: string
) {
  try {
    return JSON.parse(extractJsonText(raw)) as unknown;
  } catch {
    const repaired = await repairJson(config, raw, context);

    try {
      return JSON.parse(extractJsonText(repaired)) as unknown;
    } catch {
      throw new LLMGenerationError(`${context}失败：模型返回的内容不是合法 JSON`, 502);
    }
  }
}

async function repairJson(
  config: RuntimeLLMConfig,
  raw: string,
  context: string
) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      max_tokens: 12000,
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "你是 JSON 修复器。把用户提供的内容转换为合法 JSON；不改写、不删减、不总结。字符串中的换行必须转义为 \\n。只输出合法 JSON。"
        },
        { role: "user", content: raw }
      ]
    })
  });

  if (!response.ok) {
    const detail = await readSafeError(response);
    throw new LLMGenerationError(
      `${context}失败：JSON 修复请求失败 HTTP ${response.status}${detail ? ` ${detail}` : ""}`,
      502
    );
  }

  const payload = (await readJsonResponse(response, `${context} JSON 修复`)) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const repaired = payload.choices?.[0]?.message?.content;

  if (!repaired) {
    throw new LLMGenerationError(`${context}失败：JSON 修复没有返回 message.content`, 502);
  }

  return repaired;
}

async function extractContentBrief(
  config: RuntimeLLMConfig,
  content: Content,
  stylePreset: StylePreset
): Promise<ContentBrief> {
  const preset = loadStylePreset(stylePreset);

  return (await callChatJson(
    config,
    [
      {
        role: "system",
        content:
          "你是内容理解编辑，只负责从原文中提取结构化摘要。必须保留原文里的关键事实、型号、版本号、日期、功能点、主观评价和转折关系。不要新增事实。只输出 JSON。"
      },
      {
        role: "user",
        content: [
          content.title ? `原标题：${content.title}` : "",
          `风格预设：${preset.label}。${preset.fragment}`,
          content.userTags?.length ? `用户标签：${content.userTags.join("、")}` : "",
          `正文：\n${content.rawText}`,
          `输出字段：${JSON.stringify({
            sourceTitle: "string，可选，原文标题",
            coreTopic: "string，原文核心主题",
            summary: "string，尽量覆盖原文主要信息的摘要",
            mainPoints: "string[]，按原文顺序提炼的主要分点",
            retainedDetails: "string[]，必须保留的名称、版本号、数字、日期、观点或例子",
            keywords: "string[]，可作为标签候选",
            audience: "string，可选",
            tone: "string，可选"
          })}`
        ]
          .filter(Boolean)
          .join("\n\n")
      }
    ],
    contentBriefSchema,
    "内容理解"
  )) as ContentBrief;
}

function makePlatformContent(params: {
  content: Content;
  platform: Platform;
  parsed: Record<string, unknown>;
}) {
  const now = new Date().toISOString();
  const html = typeof params.parsed.html === "string" ? params.parsed.html : undefined;
  const body = typeof params.parsed.body === "string" ? params.parsed.body : html ?? "";
  const title = typeof params.parsed.title === "string" ? params.parsed.title : "";
  const generated: PlatformContent = {
    ...(params.parsed as Partial<PlatformContent>),
    id: createId("pc"),
    contentId: params.content.id,
    platform: params.platform,
    generationSource: "llm",
    title,
    body,
    validation: { passed: true, level: "pass", warnings: [], checks: [] },
    createdAt: now,
    updatedAt: now
  };

  generated.validation = validatePlatformContent(generated);
  return generated;
}

async function generateViaOpenAICompatible(
  config: RuntimeLLMConfig,
  content: Content,
  platform: Platform,
  stylePreset: StylePreset,
  brief: ContentBrief
): Promise<PlatformContent> {
  const prompt = buildPrompt({ content, platform, stylePreset, brief });
  const parsed = (await callChatJson(
    config,
    [
      { role: "system", content: prompt.systemPrompt },
      { role: "user", content: prompt.userMessage }
    ],
    platformOutputSchemas[platform],
    `${platform} 平台适配`
  )) as Record<string, unknown>;

  const generated = makePlatformContent({
    content,
    platform,
    parsed
  });

  return enrichPlatformImages(content, generated);
}

export async function generatePlatformContents(params: {
  content: Content;
  platforms: Platform[];
  stylePreset: StylePreset;
}) {
  const config = await getRuntimeLLMConfig();

  if (!config) {
    throw new LLMGenerationError("未配置可用的 AI 接入，请先在设置中启用并测试连接。", 400);
  }

  const brief = await extractContentBrief(config, params.content, params.stylePreset);

  return Promise.all(
    params.platforms.map((platform) =>
      generateViaOpenAICompatible(config, params.content, platform, params.stylePreset, brief)
    )
  );
}

export async function generatePlatformContent(params: {
  content: Content;
  platform: Platform;
  stylePreset: StylePreset;
}) {
  const [content] = await generatePlatformContents({
    content: params.content,
    platforms: [params.platform],
    stylePreset: params.stylePreset
  });

  return content;
}
