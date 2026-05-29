"use client";

import { Save } from "lucide-react";
import { AppNav } from "@/components/shell/AppNav";
import { Button } from "@/components/ui/button";
import { useWorkflow } from "./WorkflowProvider";

export function WorkspaceChrome() {
  const {
    state,
    saveActiveContent,
    setStatus
  } = useWorkflow();
  const hasGeneratedContent = state.settings.platforms.some(
    (platform) => Boolean(state.platformContents[platform].data)
  );
  const activeContent = state.platformContents[state.activePlatformTab].data;
  const status = state.statusMessage ?? (hasGeneratedContent ? "平台版本已就绪" : "草稿编辑中");

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
        <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
          <Save className="h-4 w-4" />
          保存草稿
        </Button>
      }
    />
  );
}
