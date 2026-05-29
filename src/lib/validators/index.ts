import type { Platform, PlatformContent, ValidationResult } from "@/types";
import { validateBilibili } from "./bilibili";
import { validateWechat } from "./wechat";
import { validateXiaohongshu } from "./xiaohongshu";
import { validateZhihu } from "./zhihu";

export const validators: Record<Platform, (content: PlatformContent) => ValidationResult> = {
  wechat: validateWechat,
  zhihu: validateZhihu,
  xiaohongshu: validateXiaohongshu,
  bilibili: validateBilibili
};

export function validatePlatformContent(content: PlatformContent) {
  return validators[content.platform](content);
}
