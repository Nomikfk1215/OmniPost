import type { PlatformContent, ValidationResult } from "@/types";
import { buildValidationResult, makeCheck } from "./shared";

export function validateBilibili(content: PlatformContent): ValidationResult {
  const tags = content.tags ?? [];
  const checks = [
    makeCheck(
      "bili-title",
      content.title.trim() ? "pass" : "error",
      content.title.trim() ? "标题已填写" : "B站专栏标题不能为空"
    ),
    makeCheck(
      "bili-description",
      content.description?.trim() ? "pass" : "error",
      content.description?.trim() ? "简介已生成" : "B站专栏简介不能为空"
    ),
    makeCheck(
      "bili-body",
      content.body.trim() ? "pass" : "error",
      content.body.trim() ? "正文已生成" : "B站专栏正文不能为空"
    ),
    makeCheck(
      "bili-tags",
      tags.length >= 3 && tags.length <= 10 ? "pass" : "warning",
      tags.length >= 3 && tags.length <= 10 ? "标签数量适合 B站专栏" : "B站标签建议 3-10 个"
    ),
    makeCheck(
      "bili-category",
      content.categorySuggestion?.trim() ? "pass" : "warning",
      content.categorySuggestion?.trim() ? "已生成分区建议" : "建议补充分区建议"
    )
  ];

  return buildValidationResult(checks);
}
