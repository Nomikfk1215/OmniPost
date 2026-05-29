"use client";

import Link from "next/link";
import { ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreviewRenderer } from "@/components/preview/PreviewRenderer";
import { ValidationPanel } from "@/components/preview/ValidationPanel";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { useWorkflow } from "./WorkflowProvider";

export function RightPanel() {
  const { state, publish } = useWorkflow();
  const activeSlot = state.platformContents[state.activePlatformTab];
  const activeContent = activeSlot.data;

  return (
    <section className="panel flex min-h-[680px] flex-col rounded-md">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-950">预览与校验</h2>
          <p className="text-xs text-gray-400">{PLATFORM_INFOS[state.activePlatformTab].label}</p>
        </div>
        <Button onClick={publish} disabled={!activeContent}>
          <Send className="h-4 w-4" />
          模拟发布
        </Button>
      </div>
      <div className="scrollbar-thin flex-1 space-y-4 overflow-auto p-4">
        {activeContent ? (
          <>
            <PreviewRenderer content={activeContent} />
            <div className="rounded-md border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-950">规则校验</h3>
                <Badge>
                  {activeContent.validation.level === "pass" ? "可发布" : "需确认"}
                </Badge>
              </div>
              <ValidationPanel checks={activeContent.validation.checks} />
            </div>
            {state.publishTask ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-3 text-sm font-semibold text-emerald-900">发布结果</div>
                <div className="space-y-2">
                  {state.publishTask.results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.url}
                      className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm text-emerald-800 hover:bg-emerald-100"
                    >
                      <span>{PLATFORM_INFOS[result.platform].label}</span>
                      <span className="inline-flex items-center gap-1">
                        查看
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="grid h-full min-h-[520px] place-items-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
            当前平台暂无预览
          </div>
        )}
      </div>
    </section>
  );
}
