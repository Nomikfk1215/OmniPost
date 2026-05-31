"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";
import type { PublicPlatformCredential } from "@/types";

type BusyState = "loading" | "saving" | "deleting" | null;
type Message = { type: "success" | "error" | "info"; text: string };

async function parseResponseError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "请求失败";
  } catch {
    return "请求失败";
  }
}

export function PlatformCredentialCard() {
  const [credentials, setCredentials] = useState<PublicPlatformCredential[]>(
    []
  );
  const [formData, setFormData] = useState<
    Record<string, Record<string, string>>
  >({});
  const [secretTouched, setSecretTouched] = useState<
    Record<string, boolean>
  >({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<BusyState>("loading");
  const [message, setMessage] = useState<Message | null>(null);

  const isBusy = busy !== null;

  const hydrate = useCallback(
    (list: PublicPlatformCredential[]) => {
      setCredentials(list);

      const nextFormData: Record<string, Record<string, string>> = {};
      const nextTouched: Record<string, boolean> = {};
      const nextShow: Record<string, boolean> = {};

      for (const cred of list) {
        nextFormData[cred.platform] = {};
        for (const [key, value] of Object.entries(cred.maskedFields)) {
          nextFormData[cred.platform][key] = value ?? "";
        }
        nextTouched[cred.platform] = false;
        nextShow[cred.platform] = false;
      }

      setFormData(nextFormData);
      setSecretTouched(nextTouched);
      setShowSecrets(nextShow);
    },
    []
  );

  const loadCredentials = useCallback(
    async (showLoading = true) => {
      if (showLoading) setBusy("loading");

      try {
        const response = await fetch("/api/settings/platform");
        if (!response.ok) throw new Error(await parseResponseError(response));
        hydrate((await response.json()) as PublicPlatformCredential[]);
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "加载配置失败"
        });
      } finally {
        if (showLoading) setBusy(null);
      }
    },
    [hydrate]
  );

  useEffect(() => {
    void loadCredentials();
  }, [loadCredentials]);

  function handleFieldChange(
    platform: string,
    fieldKey: string,
    value: string,
    isSecret: boolean
  ) {
    setFormData((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [fieldKey]: value }
    }));

    if (isSecret) {
      setSecretTouched((prev) => ({ ...prev, [platform]: true }));
    }
  }

  async function handleSave(platform: string) {
    setBusy("saving");
    setMessage(null);

    try {
      const payload: {
        platform: string;
        credentials: Record<string, string | undefined>;
      } = {
        platform,
        credentials: {}
      };

      const cred = credentials.find((c) => c.platform === platform);
      const fields = formData[platform];
      const touched = secretTouched[platform];

      for (const [key, value] of Object.entries(fields)) {
        // 对于 secret 字段，如果未修改则传 undefined（服务端保留原值）
        const fieldDef = cred
          ? { secret: key.includes("Secret") || key.includes("secret") }
          : null;
        const isSecret = fieldDef?.secret ?? false;

        if (isSecret && !touched) {
          payload.credentials[key] = undefined;
        } else {
          payload.credentials[key] = value;
        }
      }

      const response = await fetch("/api/settings/platform", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(await parseResponseError(response));

      const updated = (await response.json()) as PublicPlatformCredential;
      setCredentials((prev) =>
        prev.map((c) => (c.platform === platform ? updated : c))
      );
      setSecretTouched((prev) => ({ ...prev, [platform]: false }));
      setMessage({ type: "success", text: "配置已保存" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "保存失败"
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(platform: string) {
    const displayName =
      platform === "wechat" ? "微信公众号" : platform;
    if (
      !window.confirm(
        `清除 ${displayName} 的发布凭据后将无法真实发布，确认继续？`
      )
    ) {
      return;
    }

    setBusy("deleting");
    setMessage(null);

    try {
      const response = await fetch("/api/settings/platform", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform })
      });

      if (!response.ok) throw new Error(await parseResponseError(response));

      const reset = (await response.json()) as PublicPlatformCredential;
      setCredentials((prev) =>
        prev.map((c) => (c.platform === platform ? reset : c))
      );
      setSecretTouched((prev) => ({ ...prev, [platform]: false }));
      setMessage({ type: "success", text: "已清除凭据" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "清除失败"
      });
    } finally {
      setBusy(null);
    }
  }

  if (busy === "loading") {
    return (
      <div className="panel rounded-md p-5 text-center text-sm text-gray-400">
        正在加载平台配置...
      </div>
    );
  }

  const wechatCred = credentials.find((c) => c.platform === "wechat");
  const secondaryPlatforms = [
    {
      id: "zhihu",
      name: "知乎",
      description: "当前没有稳定的官方创作者发文 API，发布时生成辅助发布包。",
      badge: "辅助发布"
    },
    {
      id: "xiaohongshu",
      name: "小红书",
      description: "账号 OAuth 在账号页连接；笔记发布权限需平台确认，当前生成辅助发布包。",
      badge: "辅助发布"
    },
    {
      id: "bilibili",
      name: "B站专栏",
      description: "没有开放平台资质时直接走辅助发布；如果以后拿到 ATC_BASE 权限，再到账号页连接 OAuth。",
      badge: "辅助发布"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-950">
          平台凭证配置
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          配置各平台发布所需的 API 凭证。未配置的平台将自动使用模拟发布。
        </p>
      </div>

      {/* 微信公众号 */}
      <div className="grid gap-4 min-[1180px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="panel rounded-md p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-950">
                微信公众号
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                发布图文到微信公众号。需要公众号的 AppID 和 AppSecret。
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="AppID">
              <Input
                value={formData["wechat"]?.["appId"] ?? ""}
                onChange={(e) =>
                  handleFieldChange("wechat", "appId", e.target.value, false)
                }
                placeholder="wx..."
                disabled={isBusy}
              />
            </Field>

            <Field
              label="AppSecret"
              hint={
                wechatCred?.configured && !secretTouched["wechat"]
                  ? "已脱敏显示"
                  : undefined
              }
            >
              <div className="relative">
                <Input
                  value={formData["wechat"]?.["appSecret"] ?? ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "wechat",
                      "appSecret",
                      e.target.value,
                      true
                    )
                  }
                  type={showSecrets["wechat"] ? "text" : "password"}
                  placeholder={
                    wechatCred?.configured
                      ? "留空保存会保留已保存密钥"
                      : "公众号密钥"
                  }
                  className="pr-12"
                  disabled={isBusy}
                />
                <button
                  type="button"
                  title={
                    showSecrets["wechat"] ? "隐藏密钥" : "显示密钥"
                  }
                  onClick={() =>
                    setShowSecrets((prev) => ({
                      ...prev,
                      wechat: !prev["wechat"]
                    }))
                  }
                  className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  {showSecrets["wechat"] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                保存后仅在服务端密文存储，客户端不会返回明文。
              </p>
            </Field>
          </div>

          {message ? (
            <div
              className={cn(
                "mt-5 flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                message.type === "success" &&
                  "border-emerald-200 bg-emerald-50 text-emerald-700",
                message.type === "error" &&
                  "border-rose-200 bg-rose-50 text-rose-700",
                message.type === "info" &&
                  "border-sky-200 bg-sky-50 text-sky-700"
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              onClick={() => handleSave("wechat")}
              disabled={isBusy}
            >
              {busy === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              保存配置
            </Button>
            <Button
              onClick={() => handleDelete("wechat")}
              disabled={isBusy || !wechatCred?.configured}
              variant="danger"
              className="ml-auto"
            >
              {busy === "deleting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              清除配置
            </Button>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="panel rounded-md p-4">
            <h3 className="text-sm font-semibold text-gray-950">
              发布模式
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              {wechatCred?.configured
                ? "已配置微信公众号凭据，点击发布时将使用真实发布流程。"
                : "尚未配置微信公众号凭据，发布时将使用模拟模式。"}
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">状态</span>
                <span
                  className={cn(
                    "font-medium",
                    wechatCred?.configured
                      ? "text-emerald-700"
                      : "text-gray-500"
                  )}
                >
                  {wechatCred?.configured ? "已配置" : "未配置"}
                </span>
              </div>
            </div>
          </section>

          {wechatCred?.updatedAt ? (
            <section className="panel rounded-md p-4">
              <h3 className="text-sm font-semibold text-gray-950">
                最近保存
              </h3>
              <p className="mt-3 text-xs text-gray-400">
                {formatDateTime(wechatCred.updatedAt)}
              </p>
            </section>
          ) : null}
        </aside>
      </div>

      {/* 其他平台由账号连接页和辅助发布链路承接 */}
      {secondaryPlatforms.map((platform) => (
        <div key={platform.id} className="panel rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">
                {platform.name}
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                {platform.description}
              </p>
            </div>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-400">
              {platform.badge}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
