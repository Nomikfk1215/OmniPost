"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ShieldOff,
  SlidersHorizontal,
  Unplug
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_PUBLISH_CAPABILITY,
  PUBLISH_CAPABILITY_INFOS,
  createDefaultPlatformAccounts,
  normalizePlatformAccounts
} from "@/lib/platform-accounts";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import {
  PLATFORMS,
  type Platform,
  type PlatformAccount,
  type PublishCapability
} from "@/types";

type BusyState = { platform: Platform; action: "auth" | "capability" } | null;
type Message = { type: "success" | "error"; text: string };

const defaultAccounts = createDefaultPlatformAccounts();

async function parseResponseError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "请求失败";
  } catch {
    return "请求失败";
  }
}

function replaceAccount(accounts: PlatformAccount[], nextAccount: PlatformAccount) {
  return normalizePlatformAccounts(
    accounts.map((account) =>
      account.platform === nextAccount.platform ? nextAccount : account
    )
  );
}

export function AccountsClient() {
  const [accounts, setAccounts] = useState<PlatformAccount[]>(defaultAccounts);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<BusyState>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const accountByPlatform = useMemo(() => {
    return normalizePlatformAccounts(accounts).reduce(
      (result, account) => ({ ...result, [account.platform]: account }),
      {} as Record<Platform, PlatformAccount>
    );
  }, [accounts]);

  const authorizedCount = accounts.filter((account) => account.authorized).length;
  const saving = busy !== null;

  const loadAccounts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/accounts", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(await parseResponseError(response));
      }

      const payload = (await response.json()) as { accounts?: PlatformAccount[] };
      setAccounts(normalizePlatformAccounts(payload.accounts));
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "加载平台账号失败"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const accountName = params.get("accountName");
    const accountError = params.get("accountError");

    if (connected) {
      setMessage({
        type: "success",
        text: accountName ? `已连接 ${accountName}` : "平台账号已连接"
      });
      void loadAccounts();
    } else if (accountError) {
      setMessage({ type: "error", text: accountError });
    }

    if (connected || accountError) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [loadAccounts]);

  async function saveAccount(platform: Platform, patch: Partial<PlatformAccount>) {
    const current = accountByPlatform[platform];
    const optimisticAccount: PlatformAccount = {
      ...current,
      ...patch,
      platform
    };

    setAccounts((items) => replaceAccount(items, optimisticAccount));
    setMessage(null);

    try {
      const response = await fetch(`/api/accounts/${platform}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorized: patch.authorized,
          publishCapability: patch.publishCapability
        })
      });

      if (!response.ok) {
        throw new Error(await parseResponseError(response));
      }

      const payload = (await response.json()) as { account: PlatformAccount };
      setAccounts((items) => replaceAccount(items, payload.account));
      setMessage({ type: "success", text: "平台账号已保存" });
    } catch (error) {
      setAccounts((items) => replaceAccount(items, current));
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "保存平台账号失败"
      });
    }
  }

  function connectPlatform(platform: Platform) {
    window.location.assign(`/api/accounts/${platform}/connect`);
  }

  async function toggleAuthorized(platform: Platform) {
    const account = accountByPlatform[platform];
    const authorized = !account.authorized;

    setBusy({ platform, action: "auth" });
    await saveAccount(platform, {
      authorized,
      publishCapability: authorized
        ? account.publishCapability
        : DEFAULT_PUBLISH_CAPABILITY
    });
    setBusy(null);
  }

  async function updateCapability(platform: Platform, publishCapability: PublishCapability) {
    setBusy({ platform, action: "capability" });
    await saveAccount(platform, { publishCapability });
    setBusy(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 min-[1440px]:py-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-950">平台账号</h1>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            B站和小红书会跳转开放平台完成连接；微信和知乎当前保留手动标记。
          </p>
        </div>
        <Badge
          className={cn(
            "h-7 px-3",
            saving
              ? "border-sky-200 bg-sky-50 text-sky-700"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          )}
        >
          {saving ? "保存中" : "已保存"} · 已授权 {authorizedCount}/{PLATFORMS.length}
        </Badge>
      </div>

      {message ? (
        <div
          className={cn(
            "mb-4 flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
            message.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
            message.type === "error" && "border-rose-200 bg-rose-50 text-rose-700"
          )}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <ShieldOff className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-4">
        {PLATFORMS.map((platform) => {
          const info = PLATFORM_INFOS[platform];
          const account = accountByPlatform[platform];
          const authBusy = busy?.platform === platform && busy.action === "auth";
          const capabilityBusy = busy?.platform === platform && busy.action === "capability";
          const capability = PUBLISH_CAPABILITY_INFOS[account.publishCapability];
          const connectedByOAuth = account.connectionMethod === "oauth";
          const primaryLabel = account.authorized
            ? connectedByOAuth
              ? "断开连接"
              : "取消标记"
            : account.oauthSupported
              ? account.oauthConfigured
                ? "连接平台"
                : "配置后连接"
              : "手动标记";

          return (
            <section
              key={platform}
              className="panel flex min-h-[332px] flex-col rounded-md p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge className={cn("mb-3", info.accentClass)}>
                    {info.shortLabel}
                  </Badge>
                  <h2 className="truncate text-base font-semibold text-gray-950">
                    {info.label}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{info.tone}</p>
                </div>
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-md border",
                    account.authorized
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">授权状态</span>
                  <Badge
                    className={
                      account.authorized
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }
                  >
                    {account.authorized ? "已授权" : "未授权"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">账号名称</span>
                  <span className="truncate font-medium text-gray-800">
                    {account.accountName ?? (account.authorized ? "手动标记" : "未连接")}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">连接方式</span>
                  <span className="truncate font-medium text-gray-800">
                    {connectedByOAuth ? "开放平台" : account.authorized ? "手动标记" : "未连接"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">发布能力</span>
                  <span className="truncate font-medium text-gray-800">
                    {capability.label}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-5">
                {account.authorized ? (
                  <label className="mb-3 block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      发布方式
                      {capabilityBusy ? (
                        <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-sky-600" />
                      ) : null}
                    </span>
                    <select
                      value={account.publishCapability}
                      onChange={(event) =>
                        void updateCapability(
                          platform,
                          event.target.value as PublishCapability
                        )
                      }
                      disabled={loading || capabilityBusy}
                      className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                    >
                      {Object.entries(PUBLISH_CAPABILITY_INFOS).map(([value, option]) => (
                        <option key={value} value={value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <Button
                  className="w-full"
                  variant={account.authorized ? "secondary" : "primary"}
                  onClick={() =>
                    account.authorized || !account.oauthSupported
                      ? void toggleAuthorized(platform)
                      : connectPlatform(platform)
                  }
                  disabled={loading || authBusy}
                >
                  {authBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : account.authorized ? (
                    connectedByOAuth ? (
                      <Unplug className="h-4 w-4" />
                    ) : (
                      <ShieldOff className="h-4 w-4" />
                    )
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {primaryLabel}
                </Button>
                <p className="mt-2 min-h-8 text-xs leading-4 text-gray-400">
                  {account.oauthHint}
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
