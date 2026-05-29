import { AppNav } from "@/components/shell/AppNav";
import { LLMSettingsCard } from "@/components/settings/LLMSettingsCard";

export default function SettingsPage() {
  return (
    <>
      <AppNav title="系统设置" eyebrow="OmniPost Workspace" status="运行时配置" />
      <main className="ml-[216px] min-h-screen overflow-auto pt-16">
        <div className="mx-auto max-w-6xl px-4 py-5 min-[1440px]:py-6">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-950">系统设置</h1>
            <p className="mt-1 text-sm text-gray-500">
              管理 AI 生成接入、运行模式和连接状态。
            </p>
          </div>
          <LLMSettingsCard />
        </div>
      </main>
    </>
  );
}

