"use client";

import { Eye, Loader2, Save, Send } from "lucide-react";
import { AppNav } from "@/components/shell/AppNav";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "./WorkflowProvider";

export function WorkspaceChrome() {
  const {
    state,
    publish,
    saveActiveContent,
    setActivePlatform,
    setStatus
  } = useWorkflow();
  const hasGeneratedContent = state.settings.platforms.some(
    (platform) => Boolean(state.platformContents[platform].data)
  );
  const isPublishing = state.publishStatus === "publishing";
  const activeContent = state.platformContents[state.activePlatformTab].data;
  const status = state.statusMessage ?? (hasGeneratedContent ? "平台版本已就绪" : "草稿编辑中");

  function handlePreviewAll() {
    const firstReadyPlatform = state.settings.platforms.find(
      (platform) => state.platformContents[platform].data
    );

    if (!firstReadyPlatform) {
      setStatus("请先生成平台版本");
      return;
    }

    setActivePlatform(firstReadyPlatform);
    setStatus("可在预览区切换全部平台");
  }

  function handleSaveDraft() {
    if (activeContent) {
      void saveActiveContent();
      return;
    }

    setStatus("原始草稿已保留在当前工作台");
  }

  return (
    <AppNav
      title="内容编辑"
      eyebrow="创作工作台"
      status={status}
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePreviewAll}
            disabled={!hasGeneratedContent}
            className="hidden min-[1180px]:inline-flex"
          >
            <Eye className="h-4 w-4" />
            预览全部平台
          </Button>
          <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
            <Save className="h-4 w-4" />
            保存草稿
          </Button>
          <Button size="sm" onClick={publish} disabled={!hasGeneratedContent || isPublishing}>
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            一键发布
          </Button>
        </>
      }
    />
  );
}
