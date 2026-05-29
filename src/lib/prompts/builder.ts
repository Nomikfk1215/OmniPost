import { loadStylePreset } from "@/lib/presets";
import { loadPlatformSkill } from "@/lib/skills/registry";
import type { Content, Platform, StylePreset } from "@/types";

const SHARED_SYSTEM_HEADER = `你是一个专业的多平台内容编辑助手。你的任务是将用户提供的原始内容，改写为适合指定平台发布的版本。

通用规则：
- 保留原始内容的核心信息和观点，不编造事实。
- 根据平台特点调整标题、结构、语气和表达方式。
- 输出 JSON 必须严格符合指定 schema。
- 标签使用中文或中英混合，不使用纯英文标签。
- 如果用户没有提供标题，根据正文生成一个合适的标题。`;

export function buildPrompt(params: {
  content: Content;
  platform: Platform;
  stylePreset: StylePreset;
}) {
  const skill = loadPlatformSkill(params.platform);
  const preset = loadStylePreset(params.stylePreset);
  const systemPrompt = [SHARED_SYSTEM_HEADER, skill.positioning, preset.fragment].join("\n\n");
  const userMessage = [
    params.content.title ? `原标题：${params.content.title}` : "",
    `正文：\n${params.content.rawText}`,
    params.content.userTags?.length ? `用户标签：${params.content.userTags.join("、")}` : "",
    `输出字段：${JSON.stringify(skill.outputSchema)}`
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    systemPrompt,
    userMessage,
    schema: skill.outputSchema
  };
}
