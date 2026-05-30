import { createId, normalizeTag, summarizeText } from "@/lib/utils";
import { validatePlatformContent } from "@/lib/validators";
import type { Content, Platform, PlatformContent, StylePreset } from "@/types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  return compact ? [compact] : ["这是一份待适配的原始内容。"];
}

function getTags(content: Content, options?: { withHash?: boolean; min?: number }) {
  const titleTags = getBaseTitle(content)
    .split(/[，,、\s：:？?！!。；;「」“”"']+/)
    .map((item) => summarizeText(item, 12))
    .filter((item) => item.length >= 2)
    .slice(0, 3);
  const base = [
    ...(content.userTags ?? []),
    ...titleTags,
    "内容创作"
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
  const html = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "wechat",
    generationSource: "mock",
    title,
    body: html,
    html,
    digest: summarizeText(content.rawText, 118),
    coverSuggestion: `封面突出关键词“${summarizeText(title, 10)}”，使用清晰标题和干净背景。`,
    imageSuggestions: ["开头放主题封面图", "正文重点可整理为信息图", "结尾放原文核心观点总结"],
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
  const body = paragraphs
    .map((paragraph, index) => (index === 0 ? paragraph : `${index}. ${paragraph}`))
    .join("\n\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "zhihu",
    generationSource: "mock",
    title: /[？?]$/.test(title) ? title : `${title}？`,
    body,
    openingConclusion: summarizeText(paragraphs[0] ?? content.rawText, 140),
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
  const paragraphs = getParagraphs(content);
  const body = paragraphs.join("\n\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "xiaohongshu",
    generationSource: "mock",
    title: summarizeText(title, stylePreset === "casual" ? 18 : 22),
    body,
    tags: getTags(content, { withHash: true, min: 5 }).slice(0, 8),
    imageSuggestions: ["3:4 竖版封面，突出原文主题", "将关键分点整理成清单图", "补充一张结论或态度总结图"],
    interactionGuide: "可以围绕原文观点提出一个讨论问题",
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
  const body = paragraphs.map((paragraph, index) => `${index + 1}. ${paragraph}`).join("\n\n");

  const data: PlatformContent = {
    id: createId("pc"),
    contentId: content.id,
    platform: "bilibili",
    generationSource: "mock",
    title: stylePreset === "casual" ? `聊聊：${summarizeText(title, 24)}` : summarizeText(title, 30),
    description: summarizeText(content.rawText, 120),
    body,
    tags: getTags(content, { min: 4 }).slice(0, 10),
    categorySuggestion: "知识",
    coverSuggestion: `封面可以使用“${summarizeText(title, 10)}”作为主标题，搭配原文核心观点。`,
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
