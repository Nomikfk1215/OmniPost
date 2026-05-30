"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  X
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
  const [dismissedPublishTaskId, setDismissedPublishTaskId] = useState<string | null>(null);
  const isPublishing = state.publishStatus === "publishing";
  const readyCount = state.settings.platforms.filter(
    (platform) => state.platformContents[platform].data
  ).length;
  const canPublish = readyCount > 0 && !isPublishing;
  const publishTask = state.publishTask;
  const publishSucceeded = publishTask?.status === "success";
  const publishStatusText = publishTask
    ? publishTask.status === "success"
      ? publishTask.mode === "real"
        ? "发布提交成功"
        : "模拟发布成功"
      : publishTask.status === "drafted"
        ? "已创建草稿，需手动发布"
      : publishTask.status === "partial"
        ? "部分平台发布失败"
        : "发布失败"
    : null;
  const firstPublishMessage = publishTask?.results.find(
    (result) => result.message
  )?.message;
  const showPublishDialog =
    Boolean(publishTask) &&
    publishTask?.status !== "success" &&
    dismissedPublishTaskId !== publishTask?.id;

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
              {accountsError ? "平台账号同步失败，暂显示默认状态" : "勾选目标平台，确认后提交发布"}
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
            将内容提交到目标平台，并生成发布记录
          </div>
          {publishTask ? (
            <div
              className={cn(
                "rounded-md border bg-white p-2",
                publishSucceeded ? "border-emerald-200" : "border-rose-200"
              )}
            >
              <div
                className={cn(
                  "mb-2 flex items-center gap-1 text-xs font-medium",
                  publishSucceeded ? "text-emerald-700" : "text-rose-700"
                )}
              >
                {publishSucceeded ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                {publishStatusText}
              </div>
              {firstPublishMessage ? (
                <div className="mb-2 max-h-14 overflow-auto break-all rounded bg-rose-50 px-2 py-1 text-xs leading-5 text-rose-700">
                  {firstPublishMessage}
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-1">
                {publishTask.results.slice(0, 4).map((result) => {
                  const itemClass = cn(
                    "inline-flex h-7 items-center justify-between rounded px-2 text-xs",
                    result.status === "success"
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : result.status === "drafted"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                  );
                  const label = PLATFORM_INFOS[result.platform].shortLabel;

                  return result.url ? (
                    <Link key={result.id} href={result.url} className={itemClass}>
                      {label}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span key={result.id} className={itemClass} title={result.message ?? "发布失败"}>
                      {label}
                      <span>
                        {result.status === "success"
                          ? "成功"
                          : result.status === "drafted"
                            ? "草稿"
                            : "失败"}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {publishTask && showPublishDialog ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-gray-950/45 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="publish-result-title"
            className="w-full max-w-2xl rounded-md bg-white shadow-2xl"
          >
            <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
              <span
                className={cn(
                  "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full",
                  publishTask.status === "drafted"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-rose-50 text-rose-600"
                )}
              >
                <AlertCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="publish-result-title" className="text-base font-semibold text-gray-950">
                  {publishStatusText}
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  {publishTask.status === "drafted"
                    ? "公众号草稿已创建，但当前接口权限不允许 API 直接发布。请到公众号后台完成发布。"
                    : "微信接口已返回明确错误，发布未完成。请按下方原因处理后重新发布。"}
                </p>
              </div>
              <button
                type="button"
                title="关闭"
                onClick={() => setDismissedPublishTaskId(publishTask.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[58vh] overflow-auto px-5 py-4">
              <div className="space-y-3">
                {publishTask.results.map((result) => (
                  <div
                    key={result.id}
                    className={cn(
                      "rounded-md border p-3",
                      result.status === "success"
                        ? "border-emerald-200 bg-emerald-50"
                        : result.status === "drafted"
                          ? "border-amber-200 bg-amber-50"
                          : "border-rose-200 bg-rose-50"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-950">
                        {PLATFORM_INFOS[result.platform].label}
                      </span>
                      <Badge
                        className={
                          result.status === "success"
                            ? "border-emerald-200 bg-white text-emerald-700"
                            : result.status === "drafted"
                              ? "border-amber-200 bg-white text-amber-700"
                              : "border-rose-200 bg-white text-rose-700"
                        }
                      >
                        {result.status === "success"
                          ? "成功"
                          : result.status === "drafted"
                            ? "已生成草稿"
                            : "失败"}
                      </Badge>
                    </div>
                    {result.message ? (
                      <pre
                        className={cn(
                          "mt-3 whitespace-pre-wrap break-all rounded bg-white px-3 py-2 text-xs leading-5",
                          result.status === "drafted" ? "text-amber-700" : "text-rose-700"
                        )}
                      >
                        {result.message}
                      </pre>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <Button
                variant="secondary"
                onClick={() => setDismissedPublishTaskId(publishTask.id)}
              >
                关闭
              </Button>
              <Link
                href="/records"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-gray-950 px-4 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                查看发布记录
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
