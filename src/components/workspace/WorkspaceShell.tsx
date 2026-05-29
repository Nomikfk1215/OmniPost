"use client";

import { CenterPanel } from "./CenterPanel";
import { LeftPanel } from "./LeftPanel";
import { PublishSettingsPanel } from "./PublishSettingsPanel";
import { RightPanel } from "./RightPanel";

export function WorkspaceShell() {
  return (
    <main className="ml-[216px] h-screen overflow-hidden pt-16">
      <div className="grid h-[calc(100vh-64px)] grid-rows-[minmax(0,1fr)_auto] gap-3 p-3 min-[1440px]:p-4">
        <div className="grid min-h-0 grid-cols-1 gap-3 min-[1180px]:grid-cols-[360px_minmax(0,1fr)_252px] min-[1440px]:grid-cols-[380px_minmax(0,1fr)_272px]">
          <LeftPanel />
          <CenterPanel />
          <RightPanel />
        </div>
        <PublishSettingsPanel />
      </div>
    </main>
  );
}
