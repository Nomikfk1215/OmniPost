"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { loadPlatformSkill } from "@/lib/skills/registry";
import { cn, splitTags } from "@/lib/utils";
import type { Platform, PlatformContent } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

const fieldLabels: Record<string, string> = {
  title: "标题",
  digest: "摘要",
  openingConclusion: "开头结论",
  description: "简介",
  body: "正文",
  html: "正文 HTML",
  tags: "标签",
  imageSuggestions: "图片建议",
  coverSuggestion: "封面建议",
  categorySuggestion: "分区建议",
  interactionGuide: "互动引导"
};

function getFieldValue(content: PlatformContent, field: string) {
  const value = content[field as keyof PlatformContent];

  if (Array.isArray(value)) {
    return value.join("\n");
  }

  return typeof value === "string" ? value : "";
}

export function CenterPanel() {
  const {
    state,
    setActivePlatform,
    updatePlatformContent,
    saveActiveContent
  } = useWorkflow();
  const activeSlot = state.platformContents[state.activePlatformTab];
  const activeContent = activeSlot.data;
  const skill = loadPlatformSkill(state.activePlatformTab);

  function updateField(field: string, value: string) {
    if (!activeContent) {
      return;
    }

    if (field === "tags" || field === "imageSuggestions") {
      updatePlatformContent(state.activePlatformTab, {
        [field]: value
          .split(/\n|,|，/)
          .map((item) => item.trim())
          .filter(Boolean)
      } as Partial<PlatformContent>);
      return;
    }

    if (field === "html") {
      updatePlatformContent(state.activePlatformTab, { html: value, body: value });
      return;
    }

    updatePlatformContent(state.activePlatformTab, { [field]: value } as Partial<PlatformContent>);
  }

  return (
    <section className="panel flex min-h-[680px] flex-col rounded-md">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-950">平台版本</h2>
            <p className="text-xs text-gray-400">切换 Tab 编辑当前平台内容</p>
          </div>
          <Button variant="secondary" size="sm" onClick={saveActiveContent} disabled={!activeContent}>
            <Save className="h-4 w-4" />
            保存
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
          {state.settings.platforms.map((platform) => {
            const info = PLATFORM_INFOS[platform];
            const slot = state.platformContents[platform];
            const selected = state.activePlatformTab === platform;

            return (
              <button
                key={platform}
                type="button"
                onClick={() => setActivePlatform(platform)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-sm transition",
                  selected
                    ? "border-gray-950 bg-gray-950 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{info.shortLabel}</span>
                  {slot.status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className={cn("h-2 w-2 rounded-full", slot.status === "ready" ? "bg-emerald-500" : "bg-gray-300")} />
                  )}
                </span>
                <span className="mt-1 block truncate text-xs opacity-70">{info.tone}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="scrollbar-thin flex-1 overflow-auto p-4">
        {activeSlot.status === "loading" ? (
          <div className="grid h-full min-h-[420px] place-items-center text-sm text-gray-500">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在生成 {PLATFORM_INFOS[state.activePlatformTab].label}
            </span>
          </div>
        ) : activeContent ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={PLATFORM_INFOS[state.activePlatformTab].accentClass}>
                {PLATFORM_INFOS[state.activePlatformTab].label}
              </Badge>
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
            {skill.editableFields.map((field) => {
              const value = getFieldValue(activeContent, field);
              const label = fieldLabels[field] ?? field;
              const isLong = ["body", "html", "imageSuggestions"].includes(field);

              return (
                <Field key={field} label={label}>
                  {isLong ? (
                    <Textarea
                      value={value}
                      onChange={(event) => updateField(field, event.target.value)}
                      className={cn(field === "html" ? "min-h-[260px] font-mono text-xs" : "min-h-[180px]")}
                    />
                  ) : (
                    <Input value={value} onChange={(event) => updateField(field, event.target.value)} />
                  )}
                </Field>
              );
            })}
          </div>
        ) : (
          <div className="grid h-full min-h-[420px] place-items-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
            生成后在这里编辑平台版本
          </div>
        )}
      </div>
    </section>
  );
}
