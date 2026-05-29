"use client";

import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Eye,
  Loader2,
  MessageCircle,
  Sparkles,
  Tv
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PreviewRenderer } from "@/components/preview/PreviewRenderer";
import { ValidationPanel } from "@/components/preview/ValidationPanel";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

const platformIcons = {
  wechat: MessageCircle,
  zhihu: CircleHelp,
  bilibili: Tv,
  xiaohongshu: BookOpen
} satisfies Record<Platform, LucideIcon>;

export function CenterPanel() {
  const { state, setActivePlatform, generate } = useWorkflow();
  const activeSlot = state.platformContents[state.activePlatformTab];
  const activeContent = activeSlot.data;
  const isGenerating = state.settings.platforms.some(
    (platform) => state.platformContents[platform].status === "loading"
  );

  return (
    <section className="panel flex min-h-0 flex-col overflow-hidden rounded-md">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-950">平台预览区</h2>
            <p className="truncate text-xs text-gray-400">切换平台后查看预览、校验和发布状态</p>
          </div>
          <Button size="sm" onClick={generate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            生成
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {PLATFORMS.map((platform) => {
            const info = PLATFORM_INFOS[platform];
            const slot = state.platformContents[platform];
            const selected = state.activePlatformTab === platform;
            const Icon = platformIcons[platform];
            const enabled = state.settings.platforms.includes(platform);

            return (
              <button
                key={platform}
                type="button"
                onClick={() => setActivePlatform(platform)}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-md border px-2 text-sm font-medium transition",
                  selected
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                  !enabled && "opacity-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{info.shortLabel}</span>
                {slot.status === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      slot.status === "ready" && "bg-emerald-500",
                      slot.status === "error" && "bg-rose-500",
                      slot.status === "idle" && "bg-gray-300"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto bg-gray-50 p-4">
        {activeSlot.status === "loading" ? (
          <div className="grid h-full min-h-[360px] place-items-center rounded-md border border-dashed border-gray-300 bg-white text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在生成 {PLATFORM_INFOS[state.activePlatformTab].label}
            </span>
          </div>
        ) : activeSlot.status === "error" ? (
          <div className="grid h-full min-h-[360px] place-items-center rounded-md border border-rose-200 bg-rose-50 px-4 text-center text-sm text-rose-700">
            <span>
              <AlertCircle className="mx-auto mb-2 h-5 w-5" />
              {activeSlot.error ?? "生成失败，请稍后重试"}
            </span>
          </div>
        ) : activeContent ? (
          <div className="space-y-4">
            <div className="rounded-md border border-indigo-100 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700">
                  <Eye className="h-4 w-4" />
                  AI 已生成 {PLATFORM_INFOS[state.activePlatformTab].label} 版本，可继续在左侧调整原文或重新生成。
                </div>
                <Badge
                  className={cn(
                    activeContent.validation.level === "pass" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                    activeContent.validation.level === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
                    activeContent.validation.level === "error" && "border-rose-200 bg-rose-50 text-rose-700"
                  )}
                >
                  {activeContent.validation.level === "pass"
                    ? "校验通过"
                    : `${activeContent.validation.warnings.length} 条提醒`}
                </Badge>
              </div>
            </div>

            <PreviewRenderer content={activeContent} />

            <div className="rounded-md border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-950">内容检测</h3>
                <Badge>
                  {activeContent.validation.level === "pass" ? (
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      检测完成
                    </span>
                  ) : (
                    "需确认"
                  )}
                </Badge>
              </div>
              <ValidationPanel checks={activeContent.validation.checks} />
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-[360px] place-items-center rounded-md border border-dashed border-gray-300 bg-white px-4 text-center text-sm text-gray-500">
            <span>
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-gray-400" />
              生成平台版本后，这里会展示公众号、知乎、B站和小红书预览。
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
