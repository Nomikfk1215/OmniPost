import type { Platform, PlatformInfo } from "@/types";

export const PLATFORM_INFOS: Record<Platform, PlatformInfo> = {
  wechat: {
    id: "wechat",
    label: "微信公众号",
    shortLabel: "公众号",
    tone: "长文阅读",
    accentClass: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  zhihu: {
    id: "zhihu",
    label: "知乎",
    shortLabel: "知乎",
    tone: "问答论证",
    accentClass: "border-blue-200 bg-blue-50 text-blue-700"
  },
  xiaohongshu: {
    id: "xiaohongshu",
    label: "小红书",
    shortLabel: "小红书",
    tone: "图文笔记",
    accentClass: "border-rose-200 bg-rose-50 text-rose-700"
  },
  bilibili: {
    id: "bilibili",
    label: "B站专栏",
    shortLabel: "B站",
    tone: "年轻化专栏",
    accentClass: "border-sky-200 bg-sky-50 text-sky-700"
  }
};

export function getPlatformInfo(platform: Platform) {
  return PLATFORM_INFOS[platform];
}
