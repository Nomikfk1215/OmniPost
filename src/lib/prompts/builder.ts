import { loadStylePreset } from "@/lib/presets";
import { loadPlatformSkill } from "@/lib/skills/registry";
import type { ContentBrief } from "@/lib/llm/schemas";
import type { Content, Platform, StylePreset } from "@/types";

const SHARED_SYSTEM_HEADER = `你是一个专业的多平台内容编辑助手。你的任务是将用户提供的原始内容，轻度润色、分点整理为适合指定平台发布的版本。

通用规则：
- 以保留原文信息量为第一优先级，不要为了平台风格大幅删减内容。
- 只做小幅语气润色、错别字修正、段落重排和分点整理；不要改写成另一篇文章。
- 原文中的模型名、版本号、日期、价格、功能点、主观评价、转折和例子都要尽量保留。
- 正文/html 不是摘要字段。长原文可以重排为分点，但每个重要观点都应该在正文中出现。
- 如果平台风格要求短句，也只能压缩表达方式，不能删掉原文里的关键内容。
- 可以根据平台特点调整标题、结构、语气和表达方式，但不能改变原文立场。
- 标签、摘要、分点、封面和图片建议必须从原文和内容理解摘要中总结，不要套用固定模板。
- 输出 JSON 必须严格符合指定 schema。
- JSON 字符串内部不能直接换行；如需换行，必须使用 \\n 转义。
- 标签使用中文或中英混合，不使用纯英文标签。
- 如果用户没有提供标题，根据正文生成一个合适的标题。
- 只输出 JSON，不要输出 Markdown 代码块或解释文字。`;

export function buildPrompt(params: {
  content: Content;
  platform: Platform;
  stylePreset: StylePreset;
  brief?: ContentBrief;
}) {
  const skill = loadPlatformSkill(params.platform);
  const preset = loadStylePreset(params.stylePreset);
  const systemPrompt = [SHARED_SYSTEM_HEADER, skill.positioning, preset.fragment].join("\n\n");
  const userMessage = [
    params.content.title ? `原标题：${params.content.title}` : "",
    `正文：\n${params.content.rawText}`,
    params.content.userTags?.length ? `用户标签：${params.content.userTags.join("、")}` : "",
    params.brief
      ? `内容理解摘要（用于保留信息，不要当作新事实扩写）：\n${JSON.stringify(params.brief, null, 2)}`
      : "",
    `当前平台：${skill.displayName}`,
    `平台规则：${JSON.stringify({
      titleRule: skill.titleRule,
      bodyRule: skill.bodyRule,
      tagRule: skill.tagRule,
      imageRule: skill.imageRule
    })}`,
    `输出字段：${JSON.stringify(skill.outputSchema)}`,
    `正文保留要求：
1. 正文/html 需要承载原文主要信息，不要只输出摘要或结论。
2. 可以把原文改成小标题、编号列表、清单或短段落；如果原文包含模型名、产品名、版本号、会员/价格、功能点、体验评价、工具调用、缓存、模式变化等信息，都要尽量保留。
3. 标签、摘要、openingConclusion、description、coverSuggestion、imageSuggestions 可以更短，但 body/html 要尽量完整。
4. 若原文有吐槽、转折和保留意见，平台化表达时也要保留这种态度层次。`
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    systemPrompt,
    userMessage,
    schema: skill.outputSchema
  };
}
