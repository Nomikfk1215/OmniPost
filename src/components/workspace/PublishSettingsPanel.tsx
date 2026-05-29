"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PUBLISH_CAPABILITY_INFOS,
  createDefaultPlatformAccounts,
  normalizePlatformAccounts
} from "@/lib/platform-accounts";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { PLATFORMS, type Platform, type PlatformAccount } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

function accountsToRecord(accounts: PlatformAccount[]) {
  return normalizePlatformAccounts(accounts).reduce(
    (result, account) => ({ ...result, [account.platform]: account }),
    {} as Record<Platform, PlatformAccount>
  );
}

async function parseResponseError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "请求失败";
  } catch {
    return "请求失败";
  }
}

const defaultAccounts = accountsToRecord(createDefaultPlatformAccounts());

export function PublishSettingsPanel() {
  const { state, setPlatforms, publish } = useWorkflow();
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const isPublishing = state.publishStatus === "publishing";
  const readyCount = state.settings.platforms.filter(
    (platform) => state.platformContents[platform].data
  ).length;
  const canPublish = readyCount > 0 && !isPublishing;

  const loadAccounts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setAccountsLoading(true);
    }

    try {
      const response = await fetch("/api/accounts", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await parseResponseError(response));
      }

      const payload = (await response.json()) as { accounts?: PlatformAccount[] };
      setAccounts(accountsToRecord(payload.accounts ?? []));
      setAccountsError(null);
    } catch (error) {
      setAccountsError(error instanceof Error ? error.message : "平台账号同步失败");
    } finally {
      if (showLoading) {
        setAccountsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAccounts();

    function handleFocus() {
      void loadAccounts(false);
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadAccounts]);

  function togglePlatform(platform: Platform) {
    const exists = state.settings.platforms.includes(platform);
    const next = exists
      ? state.settings.platforms.filter((item) => item !== platform)
      : [...state.settings.platforms, platform];
    setPlatforms(next);
  }

  return (
    <section className="panel grid max-h-[178px] grid-cols-1 gap-3 overflow-hidden rounded-md p-3 min-[1180px]:grid-cols-[minmax(0,1fr)_300px] min-[1440px]:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-950">发布设置</h2>
            <p className="text-xs text-gray-400">
              {accountsError ? "平台账号同步失败，暂显示默认状态" : "勾选目标平台，确认后模拟发布"}
            </p>
          </div>
          <Badge className="border-gray-200 bg-white text-gray-600">
            {accountsLoading ? "同步账号中" : `已适配 ${readyCount}/${state.settings.platforms.length}`}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 min-[1180px]:grid-cols-4">
          {PLATFORMS.map((platform) => {
            const info = PLATFORM_INFOS[platform];
            const meta = accounts[platform];
            const capability = PUBLISH_CAPABILITY_INFOS[meta.publishCapability];
            const selected = state.settings.platforms.includes(platform);
            const ready = Boolean(state.platformContents[platform].data);
            const locked = selected && state.settings.platforms.length === 1;

            return (
              <label
                key={platform}
                className={cn(
                  "flex min-h-[48px] cursor-pointer items-center gap-2 rounded-md border px-3 py-2 transition",
                  selected
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-white hover:bg-gray-50",
                  locked && "cursor-not-allowed opacity-80"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={locked}
                  onChange={() => togglePlatform(platform)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-950">{info.shortLabel}</span>
                    <span className={cn("shrink-0 text-xs", ready ? "text-emerald-600" : "text-gray-400")}>
                      {ready ? "已适配" : "待适配"}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">
                      {meta.authorized ? meta.accountName ?? "已授权" : "未授权"}
                    </span>
                    <span className="truncate">{capability.label}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-2 rounded-md border border-gray-100 bg-gray-50 p-3">
        <div className="space-y-2">
          <Button className="w-full" onClick={publish} disabled={!canPublish}>
            {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            立即发布
          </Button>
          <div className="truncate text-center text-xs text-gray-500">
            将内容模拟发布到目标平台，并生成发布记录
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
