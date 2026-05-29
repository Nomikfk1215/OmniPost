"use client";

import { CenterPanel } from "./CenterPanel";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { SettingsBar } from "./SettingsBar";
import { StepIndicator } from "./StepIndicator";

export function WorkspaceShell() {
  return (
    <main className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4">
      <StepIndicator />
      <SettingsBar />
      <div className="grid gap-3 xl:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.2fr)_minmax(300px,0.9fr)]">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
    </main>
  );
}
