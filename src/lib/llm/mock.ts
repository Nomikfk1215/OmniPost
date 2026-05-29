import { createId, normalizeTag, summarizeText } from "@/lib/utils";
import { validatePlatformContent } from "@/lib/validators";
import type { Content, Platform, PlatformContent, StylePreset } from "@/types";

function getBaseTitle(content: Content) {
  if (content.title?.trim()) {
    return content.title.trim();
  }

  const firstLine = content.rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? summarizeText(firstLine, 24) : "这份内容该如何跨平台发布";
}

function getParagraphs(content: Content) {
  const paragraphs = content.rawText
    .split(/\n{1,}/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length >= 3) {
    return paragraphs.slice(0, 5);
  }

  const compact = content.rawText.replace(/\s+/g, " ").trim();
  return [
    compact || "这是一份待适配的原始内容。",
    "核心做法是先拆解主题，再整理出可执行的步骤。",
    "最后结合不同平台的阅读习惯，调整标题、结构、标签和图片建议。"
  ];
}

function getTags(content: Content, options?: { withHash?: boolean; min?: number }) {
  const base = [
    ...(content.userTags ?? []),
    "内容创作",
    "效率工具",
    "多平台发布",
    "AI写作"
  ];
  const unique = Array.from(new Set(base.map((tag) => normalizeTag(tag)).filter(Boolean)));
  const min = options?.min ?? 3;

  while (unique.length < min) {
    unique.push(["方法论", "经验分享", "创作者工具"][unique.length % 3]);
  }

  return unique.map((tag) => normalizeTag(tag, options?.withHash));
}

function makeWechat(content: Content, stylePreset: StylePreset): PlatformContent {
  const title = getBaseTitle(content);
  const paragraphs = getParagraphs(content);
  const detailTone = stylePreset === "casual" ? "更容易开始实践" : "更适合形成稳定流程";
  const html = [
    `<p>${paragraphs[0]}</p>`,
    "<h2>一、先把核心主题拆成清晰问题</h2>",
    `<p>${paragraphs[1] ?? paragraphs[0]}</p>`,
    "<p><strong>关键不是一次写完，而是先确定文章要解决什么问题。</strong></p>",
    "<h2>二、按平台阅读习惯重组结构</h2>",
    `<p>${paragraphs[2] ?? paragraphs[0]}</p>`,
    "<h2>三、用校验规则兜住发布质量</h2>",
    `<p>标题、摘要、标签和图片建议都需要经过代码校验，这样生成结果 ${detailTone}。</p>`,
    "<blockquote>一份原始内容，应该被改造成多个适合发布的版本，而不是简单复制粘贴。</blockquote>"
  ].join("\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "wechat",
    title: title.length > 28 ? title : `${title}：一套可落地的内容工作流`,
    body: html,
    html,
    digest: summarizeText(
      `本文围绕“${title}”整理出一套多平台内容改写流程，覆盖结构拆解、平台适配、预览校验和模拟发布。`,
      118
    ),
    coverSuggestion: `封面突出关键词“${summarizeText(title, 10)}”，使用清晰标题和干净背景。`,
    imageSuggestions: ["开头放主题封面图", "方法步骤处可加入流程图", "结尾放发布结果截图"],
    validation: { passed: true, level: "pass", warnings: [], checks: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.validation = validatePlatformContent(data);
  return data;
}

function makeZhihu(content: Content, stylePreset: StylePreset): PlatformContent {
  const title = getBaseTitle(content);
  const paragraphs = getParagraphs(content);
  const body = [
    "先说结论：真正有价值的不是把内容机械搬运到多个平台，而是根据平台语境重组表达。",
    "",
    "第一，先明确原始内容的核心观点。只有主题足够清楚，后续的平台标题、正文结构和标签才不会跑偏。",
    "",
    `第二，按平台调整阅读预期。比如公众号需要完整结构，知乎需要结论先行和分点论证，小红书更看重短句、标签和图片建议，B站专栏需要轻松但有信息量的表达。`,
    "",
    `第三，生成之后一定要校验。${paragraphs[1] ?? "标题长度、标签数量、摘要长度和平台特有字段，都应该由代码明确检查。"}`
  ].join("\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "zhihu",
    title: /[？?]$/.test(title) ? title : `普通人如何把“${summarizeText(title, 16)}”改成多平台内容？`,
    body,
    openingConclusion:
      stylePreset === "casual"
        ? "可以，但重点不是换个语气，而是先理解每个平台的内容结构。"
        : "可以。关键是用固定工作流，把原始内容拆成可被不同平台消费的结构化版本。",
    tags: getTags(content, { min: 2 }).slice(0, 5),
    validation: { passed: true, level: "pass", warnings: [], checks: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.validation = validatePlatformContent(data);
  return data;
}

function makeXiaohongshu(content: Content, stylePreset: StylePreset): PlatformContent {
  const title = getBaseTitle(content);
  const intro =
    stylePreset === "casual"
      ? "之前总觉得一份内容要发好多平台很麻烦，后来发现可以先拆结构再适配。"
      : "一份内容想发多个平台，不能只复制粘贴，结构要先改对。";
  const body = [
    `${intro} ✨`,
    "",
    "我会按这 4 步处理：",
    "✅ 先提炼核心观点",
    "✅ 再拆成平台需要的字段",
    "✅ 每个平台单独改标题和正文",
    "✅ 最后检查标签、摘要和图片建议",
    "",
    "适合：",
    "✅ 经常多平台发布的创作者",
    "✅ 不想反复改标题和排版的人",
    "✅ 想把内容整理得更清楚的人",
    "",
    "先收藏，下一次发内容前直接套这个流程。"
  ].join("\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "xiaohongshu",
    title: stylePreset === "casual" ? `${summarizeText(title, 10)}太省心了` : `${summarizeText(title, 12)}发布清单`,
    body,
    tags: getTags(content, { withHash: true, min: 5 }).slice(0, 8),
    imageSuggestions: ["3:4 竖版封面，标题控制在 6-10 字", "第二张做步骤清单图", "最后一张展示发布前检查表"],
    interactionGuide: "收藏后下次发文直接照着检查",
    validation: { passed: true, level: "pass", warnings: [], checks: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.validation = validatePlatformContent(data);
  return data;
}

function makeBilibili(content: Content, stylePreset: StylePreset): PlatformContent {
  const title = getBaseTitle(content);
  const paragraphs = getParagraphs(content);
  const body = [
    `最近我把“${title}”整理成了一套更适合多平台发布的流程。`,
    "",
    "1. 先把原始内容拆成标题、正文、标签和图片建议。",
    "2. 再根据平台规则分别生成公众号、知乎、小红书和 B站专栏版本。",
    "3. 每个平台单独看预览，发现标题过长、标签太少、缺少简介时再调整。",
    "",
    paragraphs[0],
    "",
    "总结一下：多平台发布不是简单复制，而是把同一个主题改造成不同平台愿意读的样子。"
  ].join("\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "bilibili",
    title: stylePreset === "casual" ? `我把${summarizeText(title, 14)}做成了发布工作流` : `${summarizeText(title, 18)}：多平台发布工作流`,
    description: summarizeText(`这篇专栏分享“${title}”的多平台内容适配方法，包含结构拆解、平台改写和模拟发布。`, 120),
    body,
    tags: getTags(content, { min: 4 }).slice(0, 10),
    categorySuggestion: "知识",
    coverSuggestion: `封面可以使用“${summarizeText(title, 10)}”作为主标题，搭配工作流步骤图。`,
    validation: { passed: true, level: "pass", warnings: [], checks: [] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.validation = validatePlatformContent(data);
  return data;
}

export function generateMockPlatformContent(
  content: Content,
  platform: Platform,
  stylePreset: StylePreset
) {
  const generators: Record<Platform, (content: Content, stylePreset: StylePreset) => PlatformContent> = {
    wechat: makeWechat,
    zhihu: makeZhihu,
    xiaohongshu: makeXiaohongshu,
    bilibili: makeBilibili
  };

  return generators[platform](content, stylePreset);
}
