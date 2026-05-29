import type { PlatformContent, ValidationResult } from "@/types";
import { buildValidationResult, hasEmoji, makeCheck } from "./shared";

export function validateXiaohongshu(content: PlatformContent): ValidationResult {
  const tags = content.tags ?? [];
  const imageSuggestions = content.imageSuggestions ?? [];
  const checks = [
    makeCheck(
      "xhs-title",
      content.title.trim() ? "pass" : "error",
      content.title.trim() ? "标题已填写" : "小红书标题不能为空"
    ),
    makeCheck(
      "xhs-title-length",
      content.title.length <= 40 ? "pass" : "warning",
      content.title.length <= 40 ? "标题符合短标题建议" : "小红书标题偏长，建议更短更直接"
    ),
    makeCheck(
      "xhs-body",
      content.body.trim() ? "pass" : "error",
      content.body.trim() ? "正文已生成" : "小红书正文不能为空"
    ),
    makeCheck(
      "xhs-tags",
      tags.length >= 3 && tags.length <= 8 ? "pass" : "warning",
      tags.length >= 3 && tags.length <= 8 ? "标签数量适合小红书" : "小红书话题标签建议 3-8 个"
    ),
    makeCheck(
      "xhs-tag-prefix",
      tags.every((tag) => tag.startsWith("#")) ? "pass" : "warning",
      tags.every((tag) => tag.startsWith("#")) ? "话题标签带有 # 前缀" : "小红书标签建议带 # 前缀"
    ),
    makeCheck(
      "xhs-image",
      imageSuggestions.length > 0 ? "pass" : "warning",
      imageSuggestions.length > 0 ? "已有图片建议" : "建议补充 3:4 封面或卡片图建议"
    ),
    makeCheck(
      "xhs-emoji",
      hasEmoji(content.body) ? "pass" : "warning",
      hasEmoji(content.body) ? "正文包含适度 emoji" : "小红书正文建议保留一点 emoji 或符号分点"
    )
  ];

  return buildValidationResult(checks);
}
