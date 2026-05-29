"use client";

import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform, type StylePreset } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

const styleOptions: Array<{ id: StylePreset; label: string }> = [
  { id: "professional", label: "专业干货型" },
  { id: "casual", label: "轻松种草型" }
];

export function SettingsBar() {
  const { state, setPlatforms, setStylePreset, generate } = useWorkflow();
  const isGenerating = state.settings.platforms.some(
    (platform) => state.platformContents[platform].status === "loading"
  );

  function togglePlatform(platform: Platform) {
    const exists = state.settings.platforms.includes(platform);
    const next = exists
      ? state.settings.platforms.filter((item) => item !== platform)
      : [...state.settings.platforms, platform];
    setPlatforms(next);
  }

  return (
    <div className="panel rounded-md px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-800">目标平台</span>
          {PLATFORMS.map((platform) => {
            const selected = state.settings.platforms.includes(platform);
            const info = PLATFORM_INFOS[platform];

            return (
              <button
                key={platform}
                type="button"
                onClick={() => togglePlatform(platform)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  selected ? info.accentClass : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                {info.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-800">风格</span>
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-1">
            {styleOptions.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setStylePreset(style.id)}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition",
                  state.settings.stylePreset === style.id
                    ? "bg-white text-gray-950 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
        <Badge className="border-gray-200 bg-white">
          已选 {state.settings.platforms.length} 个
        </Badge>
        <Button className="ml-auto" onClick={generate} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          生成平台版本
        </Button>
      </div>
    </div>
  );
}
