import type { PlatformContent, ValidationResult } from "@/types";
import { buildValidationResult, makeCheck } from "./shared";

export function validateWechat(content: PlatformContent): ValidationResult {
  const digest = content.digest ?? content.summary ?? "";
  const body = content.html ?? content.body;
  const checks = [
    makeCheck(
      "wechat-title-required",
      content.title.trim() ? "pass" : "error",
      content.title.trim() ? "标题已填写" : "公众号标题不能为空"
    ),
    makeCheck(
      "wechat-title-length",
      content.title.length <= 60 ? "pass" : "warning",
      content.title.length <= 60 ? "标题长度适合公众号" : "标题偏长，建议控制在 30 个中文字符左右"
    ),
    makeCheck(
      "wechat-digest",
      digest.trim() && digest.length <= 120 ? "pass" : "warning",
      digest.trim()
        ? "摘要长度符合 120 字以内建议"
        : "建议补充公众号摘要"
    ),
    makeCheck(
      "wechat-body",
      body.trim() ? "pass" : "error",
      body.trim() ? "正文已生成" : "公众号正文不能为空"
    ),
    makeCheck(
      "wechat-cover",
      content.coverSuggestion?.trim() ? "pass" : "warning",
      content.coverSuggestion?.trim() ? "已有封面建议" : "建议补充封面图方向"
    )
  ];

  return buildValidationResult(checks);
}
