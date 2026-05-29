import bilibiliSkill from "./bilibili.json";
import wechatSkill from "./wechat.json";
import xiaohongshuSkill from "./xiaohongshu.json";
import zhihuSkill from "./zhihu.json";
import type { Platform, PlatformSkill } from "@/types";

export const PLATFORM_SKILLS: Record<Platform, PlatformSkill> = {
  wechat: wechatSkill as PlatformSkill,
  zhihu: zhihuSkill as PlatformSkill,
  xiaohongshu: xiaohongshuSkill as PlatformSkill,
  bilibili: bilibiliSkill as PlatformSkill
};

export function loadPlatformSkill(platform: Platform) {
  return PLATFORM_SKILLS[platform];
}
