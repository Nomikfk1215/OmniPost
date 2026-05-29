import type { PlatformContent, ValidationResult } from "@/types";
import { buildValidationResult, hasEmoji, makeCheck } from "./shared";

export function validateZhihu(content: PlatformContent): ValidationResult {
  const tags = content.tags ?? [];
  const looksLikeQuestion = /[？?]|如何|怎么|为什么|是否|能不能/.test(content.title);
  const checks = [
    makeCheck(
      "zhihu-title",
      content.title.trim() ? "pass" : "error",
      content.title.trim() ? "标题已填写" : "知乎标题不能为空"
    ),
    makeCheck(
      "zhihu-question-title",
      looksLikeQuestion ? "pass" : "warning",
      looksLikeQuestion ? "标题符合问题式或观点式表达" : "建议改成问题式标题或清晰观点标题"
    ),
    makeCheck(
      "zhihu-opening",
      content.openingConclusion?.trim() ? "pass" : "warning",
      content.openingConclusion?.trim() ? "已提供开头结论" : "知乎建议开头直接给结论"
    ),
    makeCheck(
      "zhihu-body",
      content.body.trim() ? "pass" : "error",
      content.body.trim() ? "正文已生成" : "知乎正文不能为空"
    ),
    makeCheck(
      "zhihu-tags",
      tags.length >= 2 && tags.length <= 5 ? "pass" : "warning",
      tags.length >= 2 && tags.length <= 5 ? "标签数量适合知乎" : "知乎标签建议 2-5 个"
    ),
    makeCheck(
      "zhihu-emoji",
      hasEmoji(content.title + content.body) ? "warning" : "pass",
      hasEmoji(content.title + content.body) ? "知乎不建议大量使用 emoji" : "语气保持理性"
    )
  ];

  return buildValidationResult(checks);
}
