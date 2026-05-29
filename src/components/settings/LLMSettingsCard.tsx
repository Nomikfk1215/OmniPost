"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  PlugZap,
  Save,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";
import type { LLMRuntimeMode, PublicLLMSettings } from "@/types";

type BusyState = "loading" | "saving" | "testing" | "deleting" | null;
type Message = { type: "success" | "error" | "info"; text: string };

const emptySettings: PublicLLMSettings = {
  configured: false,
  maskedKey: null,
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  enabled: true,
  connectionStatus: "unknown",
  lastTestedAt: null,
  lastTestError: null,
  mode: "mock",
  envConfigured: false,
  updatedAt: null
};

const modeLabels: Record<LLMRuntimeMode, { label: string; text: string; className: string }> = {
  ui: {
    label: "UI 配置",
    text: "生成时使用此页面保存的 API Key。",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700"
  },
  env: {
    label: "环境变量",
    text: "当前没有可用的 UI Key，生成时使用环境变量兜底。",
    className: "border-sky-200 bg-sky-50 text-sky-700"
  },
  mock: {
    label: "Mock 模板",
    text: "当前未接入可用 LLM，生成时使用本地模板。",
    className: "border-amber-200 bg-amber-50 text-amber-700"
  },
  disabled: {
    label: "已关闭",
    text: "LLM 生成已手动关闭，生成时使用本地模板。",
    className: "border-gray-200 bg-gray-50 text-gray-700"
  }
};

async function parseResponseError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? "请求失败";
  } catch {
    return "请求失败";
  }
}

export function LLMSettingsCard() {
  const [settings, setSettings] = useState<PublicLLMSettings>(emptySettings);
  const [baseUrl, setBaseUrl] = useState(emptySettings.baseUrl);
  const [model, setModel] = useState(emptySettings.model);
  const [enabled, setEnabled] = useState(emptySettings.enabled);
  const [apiKey, setApiKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState<BusyState>("loading");
  const [message, setMessage] = useState<Message | null>(null);

  const mode = modeLabels[settings.mode];
  const canSubmit = Boolean(baseUrl.trim() && model.trim());
  const isBusy = busy !== null;

  const statusText = useMemo(() => {
    if (settings.connectionStatus === "connected") {
      return settings.lastTestedAt
        ? `已连接 · ${formatDateTime(settings.lastTestedAt)}`
        : "已连接";
    }

    if (settings.connectionStatus === "failed") {
      return settings.lastTestError ?? "连接失败";
    }

    return settings.configured ? "已保存，尚未测试" : "尚未配置 API Key";
  }, [settings]);

  const hydrate = useCallback((nextSettings: PublicLLMSettings) => {
    setSettings(nextSettings);
    setBaseUrl(nextSettings.baseUrl);
    setModel(nextSettings.model);
    setEnabled(nextSettings.enabled);
    setApiKey(nextSettings.maskedKey ?? "");
    setKeyTouched(false);
  }, []);

  const loadSettings = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setBusy("loading");
    }

    try {
      const response = await fetch("/api/settings/llm");

      if (!response.ok) {
        throw new Error(await parseResponseError(response));
      }

      hydrate((await response.json()) as PublicLLMSettings);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "加载配置失败"
      });
    } finally {
      if (showLoading) {
        setBusy(null);
      }
    }
  }, [hydrate]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    setKeyTouched(true);
  }

  async function handleSave() {
    setBusy("saving");
    setMessage(null);

    try {
      const payload: {
        apiKey?: string;
        baseUrl: string;
        model: string;
        enabled: boolean;
      } = {
        baseUrl: baseUrl.trim(),
        model: model.trim(),
        enabled
      };

      if (keyTouched) {
        payload.apiKey = apiKey;
      }

      const response = await fetch("/api/settings/llm", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await parseResponseError(response));
      }

      hydrate((await response.json()) as PublicLLMSettings);
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

  async function handleTest() {
    setBusy("testing");
    setMessage(null);

    try {
      const response = await fetch("/api/settings/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: keyTouched ? apiKey : undefined,
          baseUrl: baseUrl.trim(),
          model: model.trim()
        })
      });
      const result = (await response.json()) as {
        ok?: boolean;
        latencyMs?: number;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "连接测试失败");
      }

      if (!keyTouched) {
        await loadSettings(false);
      }

      setMessage({
        type: "success",
        text: `连接成功，耗时 ${result.latencyMs ?? 0}ms`
      });
    } catch (error) {
      if (!keyTouched) {
        await loadSettings(false);
      }

      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "连接测试失败"
      });
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm("清除后将回退到环境变量或 Mock 模式，确认继续？")) {
      return;
    }

    setBusy("deleting");
    setMessage(null);

    try {
      const response = await fetch("/api/settings/llm", { method: "DELETE" });

      if (!response.ok) {
        throw new Error(await parseResponseError(response));
      }

      hydrate((await response.json()) as PublicLLMSettings);
      setMessage({ type: "success", text: "已清除 UI 配置" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "清除失败"
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-4 min-[1180px]:grid-cols-[minmax(0,1fr)_320px]">
      <section className="panel rounded-md p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-950">AI 生成配置</h2>
            <p className="mt-1 text-sm text-gray-500">
              接入 OpenAI-compatible API 后，平台适配会优先使用 AI 生成。
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((value) => !value)}
            className={cn(
              "flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition",
              enabled
                ? "border-emerald-200 bg-emerald-500"
                : "border-gray-200 bg-gray-200"
            )}
            title={enabled ? "关闭 LLM 生成" : "启用 LLM 生成"}
          >
            <span
              className={cn(
                "h-6 w-6 rounded-full bg-white shadow-sm transition",
                enabled && "translate-x-6"
              )}
            />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <Field label="API 地址">
            <Input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://api.openai.com/v1"
              disabled={isBusy}
            />
          </Field>

          <Field label="模型名称">
            <Input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="gpt-4o-mini"
              disabled={isBusy}
            />
          </Field>

          <Field
            label="API Key"
            hint={settings.configured && !keyTouched ? "已脱敏显示" : undefined}
          >
            <div className="relative">
              <Input
                value={apiKey}
                onChange={(event) => handleApiKeyChange(event.target.value)}
                type={showKey ? "text" : "password"}
                placeholder={settings.configured ? "留空保存会清除已保存 Key" : "sk-..."}
                className="pr-12"
                disabled={isBusy}
              />
              <button
                type="button"
                title={showKey ? "隐藏 Key" : "显示 Key"}
                onClick={() => setShowKey((value) => !value)}
                className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              message.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
              message.type === "error" && "border-rose-200 bg-rose-50 text-rose-700",
              message.type === "info" && "border-sky-200 bg-sky-50 text-sky-700"
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
          <Button onClick={handleTest} disabled={isBusy || !canSubmit} variant="secondary">
            {busy === "testing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlugZap className="h-4 w-4" />
            )}
            测试连接
          </Button>
          <Button onClick={handleSave} disabled={isBusy || !canSubmit}>
            {busy === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            保存配置
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isBusy || !settings.updatedAt}
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-gray-950">当前模式</h3>
            <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", mode.className)}>
              {mode.label}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-500">{mode.text}</p>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">环境变量</span>
              <span className="font-medium text-gray-800">
                {settings.envConfigured ? "已配置" : "未配置"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">UI Key</span>
              <span className="font-medium text-gray-800">
                {settings.configured ? "已保存" : "未保存"}
              </span>
            </div>
          </div>
        </section>

        <section className="panel rounded-md p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-950">连接状态</h3>
          </div>
          <p
            className={cn(
              "mt-3 text-sm leading-6",
              settings.connectionStatus === "connected" && "text-emerald-700",
              settings.connectionStatus === "failed" && "text-rose-700",
              settings.connectionStatus === "unknown" && "text-gray-500"
            )}
          >
            {busy === "loading" ? "正在加载..." : statusText}
          </p>
          {settings.updatedAt ? (
            <p className="mt-3 text-xs text-gray-400">
              最近保存：{formatDateTime(settings.updatedAt)}
            </p>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
