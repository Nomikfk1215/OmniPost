"use client";

import { CenterPanel } from "./CenterPanel";
import { LeftPanel } from "./LeftPanel";
import { PublishSettingsPanel } from "./PublishSettingsPanel";
import { WorkflowGuide } from "./WorkflowGuide";

export function WorkspaceShell() {
  return (
    <main className="ml-[216px] h-screen overflow-hidden pt-16">
      <div className="grid h-[calc(100vh-64px)] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-3 min-[1440px]:p-4">
        <WorkflowGuide />
        <div className="grid min-h-0 grid-cols-1 gap-3 min-[1180px]:grid-cols-[420px_minmax(0,1fr)] min-[1440px]:grid-cols-[460px_minmax(0,1fr)]">
          <LeftPanel />
          <CenterPanel />
        </div>
        <PublishSettingsPanel />
      </div>
    </main>
  );
}
