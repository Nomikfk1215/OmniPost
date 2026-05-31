"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Send,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createDefaultPlatformAccounts,
  normalizePlatformAccounts
} from "@/lib/platform-accounts";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { copyPlatformContentAsRichText } from "@/lib/publish/clipboard";
import { cn } from "@/lib/utils";
import {
  PLATFORMS,
  type Platform,
  type PlatformAccount,
  type PlatformContent,
  type PlatformPublishCapability,
  type PublishResult,
  type PublishTask
} from "@/types";
import { useWorkflow } from "./WorkflowProvider";

function accountsToRecord(accounts: PlatformAccount[]) {
  return normalizePlatformAccounts(accounts).reduce(
    (result, account) => ({ ...result, [account.platform]: account }),
    {} as Record<Platform, PlatformAccount>
  );
}

function capabilitiesToRecord(capabilities: PlatformPublishCapability[]) {
  return capabilities.reduce(
    (result, capability) => ({ ...result, [capability.platform]: capability }),
    {} as Partial<Record<Platform, PlatformPublishCapability>>
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

function taskStatusText(task: PublishTask) {
  if (task.status === "success") {
    return task.mode === "real" ? "发布提交成功" : "模拟发布成功";
  }
  if (task.status === "drafted") return "已创建草稿，需手动发布";
  if (task.status === "assist") return "已生成辅助发布包";
  if (task.status === "partial") return "部分平台未完成";
  return "发布失败";
}

function resultStatusLabel(status: PublishResult["status"]) {
  if (status === "success") return "成功";
  if (status === "drafted") return "草稿";
  if (status === "assist") return "辅助";
  return "失败";
}

function resultTone(status: PublishResult["status"]) {
  if (status === "success") return "emerald";
  if (status === "drafted") return "amber";
  if (status === "assist") return "sky";
  return "rose";
}

function modeLabel(capability?: PlatformPublishCapability) {
  if (!capability) return "同步中";
  if (capability.realReady) return "真实发布";
  if (capability.assistSupported) return "辅助发布";
  if (capability.realSupported) return "缺少授权";
  return "模拟发布";
}

const defaultAccounts = accountsToRecord(createDefaultPlatformAccounts());

export function PublishSettingsPanel() {
  const { state, setPlatforms, publish } = useWorkflow();
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [capabilities, setCapabilities] = useState<
    Partial<Record<Platform, PlatformPublishCapability>>
  >({});
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [dismissedPublishTaskId, setDismissedPublishTaskId] =
    useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);
  const [copyingPlatform, setCopyingPlatform] = useState<Platform | null>(null);

  const isPublishing = state.publishStatus === "publishing";
  const readyCount = state.settings.platforms.filter(
    (platform) => state.platformContents[platform].data
  ).length;
  const canPublish = readyCount > 0 && !isPublishing;
  const publishTask = state.publishTask;
  const publishSucceeded = publishTask?.status === "success";
  const publishStatusText = publishTask ? taskStatusText(publishTask) : null;
  const firstPublishMessage = publishTask?.results.find(
    (result) => result.message
  )?.message;
  const showPublishDialog =
    Boolean(publishTask) &&
    publishTask?.status !== "success" &&
    dismissedPublishTaskId !== publishTask?.id;
  const platformContentByPlatform = useMemo(() => {
    return PLATFORMS.reduce((result, platform) => {
      const content = state.platformContents[platform].data;
      if (content) {
        result[platform] = content;
      }
      return result;
    }, {} as Partial<Record<Platform, PlatformContent>>);
  }, [state.platformContents]);
  const assistResults =
    publishTask?.results.filter(
      (result) =>
        result.status === "assist" &&
        Boolean(platformContentByPlatform[result.platform])
    ) ?? [];

  const loadAccounts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setAccountsLoading(true);
    }

    try {
      const [accountsResponse, capabilitiesResponse] = await Promise.all([
        fetch("/api/accounts", { cache: "no-store" }),
        fetch("/api/publish/capabilities", { cache: "no-store" })
      ]);

      if (!accountsResponse.ok) {
        throw new Error(await parseResponseError(accountsResponse));
      }

      if (!capabilitiesResponse.ok) {
        throw new Error(await parseResponseError(capabilitiesResponse));
      }

      const accountsPayload = (await accountsResponse.json()) as {
        accounts?: PlatformAccount[];
      };
      const capabilitiesPayload = (await capabilitiesResponse.json()) as {
        capabilities?: PlatformPublishCapability[];
      };

      setAccounts(accountsToRecord(accountsPayload.accounts ?? []));
      setCapabilities(
        capabilitiesToRecord(capabilitiesPayload.capabilities ?? [])
      );
      setAccountsError(null);
    } catch (error) {
      setAccountsError(
        error instanceof Error ? error.message : "平台账号同步失败"
      );
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

  async function copyAssistPackage(platform: Platform) {
    const content = platformContentByPlatform[platform];
    if (!content) return;

    setCopyingPlatform(platform);
    try {
      await copyPlatformContentAsRichText(content);
      setCopiedPlatform(platform);
      window.setTimeout(() => setCopiedPlatform(null), 1800);
    } finally {
      setCopyingPlatform(null);
    }
  }

  return (
    <section className="panel grid grid-cols-1 gap-3 rounded-md p-3 min-[1180px]:grid-cols-[minmax(0,1fr)_300px] min-[1440px]:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-950">发布设置</h2>
            <p className="text-xs text-gray-400">
              {accountsError
                ? "平台账号同步失败，暂显示默认状态"
                : "勾选目标平台，确认后提交发布"}
            </p>
          </div>
          <Badge className="border-gray-200 bg-white text-gray-600">
            {accountsLoading
              ? "同步账号中"
              : `已适配 ${readyCount}/${state.settings.platforms.length}`}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 min-[1180px]:grid-cols-4">
          {PLATFORMS.map((platform) => {
            const info = PLATFORM_INFOS[platform];
            const account = accounts[platform];
            const capability = capabilities[platform];
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
                    <span className="truncate text-sm font-semibold text-gray-950">
                      {info.shortLabel}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-xs",
                        ready ? "text-emerald-600" : "text-gray-400"
                      )}
                    >
                      {ready ? "已适配" : "待适配"}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-gray-500">
                    <span className="truncate">
                      {account.authorized
                        ? account.accountName ?? "已授权"
                        : "未授权"}
                    </span>
                    <span
                      className="truncate"
                      title={capability?.reasons.join("；")}
                    >
                      {modeLabel(capability)}
                    </span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {assistResults.length ? (
          <div className="mt-3 rounded-md border border-sky-100 bg-sky-50/60 p-2">
            <div className="mb-2 text-xs font-medium text-sky-700">
              辅助发布复制
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {assistResults.map((result) => (
                <button
                  key={`${result.id}-copy`}
                  type="button"
                  onClick={() => void copyAssistPackage(result.platform)}
                  disabled={copyingPlatform === result.platform}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-sky-200 bg-white px-2 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                >
                  {copiedPlatform === result.platform ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copyingPlatform === result.platform
                    ? "处理图片中"
                    : copiedPlatform === result.platform
                      ? "已复制"
                      : `一键复制${PLATFORM_INFOS[result.platform].shortLabel}`}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-2 rounded-md border border-gray-100 bg-gray-50 p-3">
        <Button className="w-full" onClick={publish} disabled={!canPublish}>
          {isPublishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          立即发布
        </Button>
        <div className="truncate text-center text-xs text-gray-500">
          真实发布优先；未开放写入 API 的平台会生成辅助发布包
        </div>

        {publishTask ? (
          <div
            className={cn(
              "rounded-md border bg-white p-2",
              publishSucceeded ? "border-emerald-200" : "border-amber-200"
            )}
          >
            <div
              className={cn(
                "mb-2 flex items-center gap-1 text-xs font-medium",
                publishSucceeded ? "text-emerald-700" : "text-amber-700"
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
              <div className="mb-2 max-h-14 overflow-auto break-all rounded bg-gray-50 px-2 py-1 text-xs leading-5 text-gray-700">
                {firstPublishMessage}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-1">
              {publishTask.results.slice(0, 4).map((result) => {
                const tone = resultTone(result.status);
                const itemClass = cn(
                  "inline-flex h-7 items-center justify-between rounded px-2 text-xs",
                  tone === "emerald" && "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                  tone === "amber" && "bg-amber-50 text-amber-700",
                  tone === "sky" && "bg-sky-50 text-sky-700 hover:bg-sky-100",
                  tone === "rose" && "bg-rose-50 text-rose-700"
                );
                const label = PLATFORM_INFOS[result.platform].shortLabel;

                return result.url ? (
                  <Link key={result.id} href={result.url} className={itemClass}>
                    {label}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : (
                  <span
                    key={result.id}
                    className={itemClass}
                    title={result.message ?? "发布未完成"}
                  >
                    {label}
                    <span>{resultStatusLabel(result.status)}</span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}
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
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="publish-result-title" className="text-base font-semibold text-gray-950">
                  {publishStatusText}
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  以下是各平台返回的真实结果。辅助发布表示平台没有稳定写入 API，OmniPost 已生成可复制的发布包。
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
                {publishTask.results.map((result) => {
                  const tone = resultTone(result.status);

                  return (
                    <div
                      key={result.id}
                      className={cn(
                        "rounded-md border p-3",
                        tone === "emerald" && "border-emerald-200 bg-emerald-50",
                        tone === "amber" && "border-amber-200 bg-amber-50",
                        tone === "sky" && "border-sky-200 bg-sky-50",
                        tone === "rose" && "border-rose-200 bg-rose-50"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-950">
                          {PLATFORM_INFOS[result.platform].label}
                        </span>
                        <Badge
                          className={cn(
                            "bg-white",
                            tone === "emerald" && "border-emerald-200 text-emerald-700",
                            tone === "amber" && "border-amber-200 text-amber-700",
                            tone === "sky" && "border-sky-200 text-sky-700",
                            tone === "rose" && "border-rose-200 text-rose-700"
                          )}
                        >
                          {resultStatusLabel(result.status)}
                        </Badge>
                      </div>
                      {result.message ? (
                        <pre
                          className={cn(
                            "mt-3 whitespace-pre-wrap break-all rounded bg-white px-3 py-2 text-xs leading-5",
                            tone === "emerald" && "text-emerald-700",
                            tone === "amber" && "text-amber-700",
                            tone === "sky" && "text-sky-700",
                            tone === "rose" && "text-rose-700"
                          )}
                        >
                          {result.message}
                        </pre>
                      ) : null}
                      {result.status === "assist" &&
                      platformContentByPlatform[result.platform] ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => void copyAssistPackage(result.platform)}
                            disabled={copyingPlatform === result.platform}
                            className="border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
                          >
                            {copiedPlatform === result.platform ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            {copyingPlatform === result.platform
                              ? "处理图片中"
                              : copiedPlatform === result.platform
                                ? "已复制"
                                : "一键复制发布包"}
                          </Button>
                          {result.url ? (
                            <Link
                              href={result.url}
                              className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                              打开详情页
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
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
