"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Radio,
  Send,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

type PublishMode = "real" | "mock";

const platformStatus: Record<
  Platform,
  { authorized: boolean; capability: string; note: string }
> = {
  wechat: { authorized: true, capability: "可真实发布", note: "接口状态正常" },
  zhihu: { authorized: false, capability: "模拟发布", note: "待授权" },
  bilibili: { authorized: true, capability: "模拟投稿", note: "专栏草稿" },
  xiaohongshu: { authorized: false, capability: "辅助发布", note: "待授权" }
};

export function PublishSettingsPanel() {
  const { state, setPlatforms, publish } = useWorkflow();
  const [mode, setMode] = useState<PublishMode>("mock");
  const isPublishing = state.publishStatus === "publishing";
  const readyCount = state.settings.platforms.filter(
    (platform) => state.platformContents[platform].data
  ).length;
  const canPublish = mode === "mock" && readyCount > 0 && !isPublishing;

  function togglePlatform(platform: Platform) {
    const exists = state.settings.platforms.includes(platform);
    const next = exists
      ? state.settings.platforms.filter((item) => item !== platform)
      : [...state.settings.platforms, platform];
    setPlatforms(next);
  }

  return (
    <section className="panel grid max-h-[230px] grid-cols-1 gap-3 overflow-hidden rounded-md p-3 min-[1180px]:grid-cols-[minmax(0,1fr)_300px] min-[1440px]:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-950">发布设置</h2>
            <p className="text-xs text-gray-400">选择发布平台、授权状态和发布模式</p>
          </div>
          <Badge className="border-gray-200 bg-white text-gray-600">
            已生成 {readyCount}/{state.settings.platforms.length}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 min-[1180px]:grid-cols-4">
          {PLATFORMS.map((platform) => {
            const info = PLATFORM_INFOS[platform];
            const meta = platformStatus[platform];
            const selected = state.settings.platforms.includes(platform);
            const ready = Boolean(state.platformContents[platform].data);

            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "min-h-[92px] rounded-md border p-3 text-left transition",
                  selected
                    ? "border-emerald-200 bg-emerald-50 shadow-sm"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-950">{info.shortLabel}</span>
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full border text-[10px]",
                      selected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-300 bg-white text-transparent"
                    )}
                  >
                    ✓
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <ShieldCheck className={cn("h-3.5 w-3.5", meta.authorized ? "text-emerald-600" : "text-gray-400")} />
                  <span className={meta.authorized ? "text-emerald-700" : "text-gray-500"}>
                    {meta.authorized ? "已授权" : "未授权"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{meta.capability}</span>
                  <span className={ready ? "text-emerald-600" : "text-gray-400"}>
                    {ready ? "已生成" : meta.note}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-between gap-3 rounded-md border border-gray-100 bg-gray-50 p-3">
        <div className="space-y-3">
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-950">发布模式</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "real" as const, label: "真实发布" },
                { id: "mock" as const, label: "模拟发布" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-medium transition",
                    mode === item.id
                      ? "border-indigo-300 bg-white text-indigo-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-500 hover:text-gray-800"
                  )}
                >
                  <Radio className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
          >
            <CalendarClock className="h-4 w-4" />
            定时发布
          </button>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={publish} disabled={!canPublish}>
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            立即发布
          </Button>
          <div className="text-center text-xs text-gray-500">
            {mode === "real" ? "真实发布 API 暂未接入，本轮使用模拟发布" : "将内容模拟发布到目标平台，并生成发布记录"}
          </div>
          {state.publishTask ? (
            <div className="rounded-md border border-emerald-200 bg-white p-2">
              <div className="mb-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                发布记录已生成
              </div>
              <div className="grid grid-cols-2 gap-1">
                {state.publishTask.results.slice(0, 4).map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    className="inline-flex h-7 items-center justify-between rounded bg-emerald-50 px-2 text-xs text-emerald-800 hover:bg-emerald-100"
                  >
                    {PLATFORM_INFOS[result.platform].shortLabel}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
