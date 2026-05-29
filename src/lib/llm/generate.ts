import { buildPrompt } from "@/lib/prompts/builder";
import { generateMockPlatformContent } from "@/lib/llm/mock";
import { getRuntimeLLMConfig } from "@/lib/llm/settings-store";
import { validatePlatformContent } from "@/lib/validators";
import type { Content, Platform, PlatformContent, StylePreset } from "@/types";

async function generateViaOpenAICompatible(
  content: Content,
  platform: Platform,
  stylePreset: StylePreset
): Promise<PlatformContent | null> {
  const config = await getRuntimeLLMConfig();

  if (!config) {
    return null;
  }

  const prompt = buildPrompt({ content, platform, stylePreset });

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt.systemPrompt },
          { role: "user", content: prompt.userMessage }
        ]
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content;

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PlatformContent>;
    const now = new Date().toISOString();
    const generated: PlatformContent = {
      id: `pc_${Date.now()}`,
      contentId: content.id,
      platform,
      title: parsed.title ?? "",
      body: parsed.body ?? parsed.html ?? "",
      ...parsed,
      validation: { passed: true, level: "pass", warnings: [], checks: [] },
      createdAt: now,
      updatedAt: now
    };
    generated.validation = validatePlatformContent(generated);
    return generated;
  } catch {
    return null;
  }
}

export async function generatePlatformContent(params: {
  content: Content;
  platform: Platform;
  stylePreset: StylePreset;
}) {
  const llmContent = await generateViaOpenAICompatible(
    params.content,
    params.platform,
    params.stylePreset
  );

  return llmContent ?? generateMockPlatformContent(params.content, params.platform, params.stylePreset);
}
