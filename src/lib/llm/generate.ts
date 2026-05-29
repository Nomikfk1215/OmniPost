import { buildPrompt } from "@/lib/prompts/builder";
import { generateMockPlatformContent } from "@/lib/llm/mock";
import { validatePlatformContent } from "@/lib/validators";
import type { Content, Platform, PlatformContent, StylePreset } from "@/types";

async function generateViaOpenAICompatible(
  content: Content,
  platform: Platform,
  stylePreset: StylePreset
): Promise<PlatformContent | null> {
  if (process.env.OMNIPOST_USE_LLM !== "true" || !process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = buildPrompt({ content, platform, stylePreset });
  const baseUrl = process.env.OMNIPOST_OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.OMNIPOST_OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
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
