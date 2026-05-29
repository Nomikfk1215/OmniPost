import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { readStore, writeStore } from "@/lib/db/json-store";
import type { PublicLLMSettings, StoredLLMSettings } from "@/types";

export const DEFAULT_LLM_BASE_URL = "https://api.openai.com/v1";
export const DEFAULT_LLM_MODEL = "gpt-4o-mini";

type SaveLLMSettingsInput = {
  apiKey?: string;
  baseUrl: string;
  model: string;
  enabled: boolean;
};

export type RuntimeLLMConfig = {
  source: "settings" | "env";
  apiKey: string;
  baseUrl: string;
  model: string;
};

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

function envLLMConfigured() {
  return process.env.OMNIPOST_USE_LLM === "true" && Boolean(process.env.OPENAI_API_KEY);
}

function getEnvBaseUrl() {
  return normalizeBaseUrl(process.env.OMNIPOST_OPENAI_BASE_URL ?? DEFAULT_LLM_BASE_URL);
}

function getEnvModel() {
  return process.env.OMNIPOST_OPENAI_MODEL ?? DEFAULT_LLM_MODEL;
}

function safeDecrypt(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

export function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) {
    return "****";
  }

  const prefix = apiKey.startsWith("sk-") ? apiKey.slice(0, 3) : apiKey.slice(0, 4);
  return `${prefix}****${apiKey.slice(-4)}`;
}

export function isMaskedApiKey(value: string) {
  return value.includes("****");
}

export async function getStoredLLMSettings() {
  const store = await readStore();
  return store.llmSettings;
}

export async function getPublicLLMSettings(): Promise<PublicLLMSettings> {
  const settings = await getStoredLLMSettings();
  const envConfigured = envLLMConfigured();

  if (!settings) {
    return {
      configured: false,
      maskedKey: null,
      baseUrl: getEnvBaseUrl(),
      model: getEnvModel(),
      enabled: true,
      connectionStatus: "unknown",
      lastTestedAt: null,
      lastTestError: null,
      mode: envConfigured ? "env" : "mock",
      envConfigured,
      updatedAt: null
    };
  }

  const decryptedKey = safeDecrypt(settings.apiKey);
  const configured = Boolean(decryptedKey);
  const mode = !settings.enabled
    ? "disabled"
    : configured
      ? "ui"
      : envConfigured
        ? "env"
        : "mock";

  return {
    configured,
    maskedKey: decryptedKey ? maskApiKey(decryptedKey) : null,
    baseUrl: settings.baseUrl,
    model: settings.model,
    enabled: settings.enabled,
    connectionStatus: settings.connectionStatus,
    lastTestedAt: settings.lastTestedAt,
    lastTestError: settings.lastTestError,
    mode,
    envConfigured,
    updatedAt: settings.updatedAt
  };
}

export async function saveLLMSettings(input: SaveLLMSettingsInput) {
  const store = await readStore();
  const current = store.llmSettings;
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  const model = input.model.trim();

  let apiKey = current?.apiKey ?? null;
  const incomingKey = input.apiKey?.trim();

  if (input.apiKey !== undefined) {
    if (!incomingKey) {
      apiKey = null;
    } else if (isMaskedApiKey(incomingKey) && current?.apiKey) {
      apiKey = current.apiKey;
    } else {
      apiKey = encryptSecret(incomingKey);
    }
  }

  const keyChanged = apiKey !== (current?.apiKey ?? null);
  const endpointChanged = baseUrl !== current?.baseUrl || model !== current?.model;
  const shouldResetTest = keyChanged || endpointChanged;
  const now = new Date().toISOString();
  const nextSettings: StoredLLMSettings = {
    provider: "openai-compatible",
    apiKey,
    baseUrl,
    model,
    enabled: input.enabled,
    connectionStatus: shouldResetTest ? "unknown" : current?.connectionStatus ?? "unknown",
    lastTestedAt: shouldResetTest ? null : current?.lastTestedAt ?? null,
    lastTestError: shouldResetTest ? null : current?.lastTestError ?? null,
    updatedAt: now
  };

  await writeStore({ ...store, llmSettings: nextSettings });
  return nextSettings;
}

export async function deleteLLMSettings() {
  const store = await readStore();
  await writeStore({ ...store, llmSettings: null });
}

export async function updateLLMConnectionStatus(input: {
  ok: boolean;
  testedAt: string;
  error?: string | null;
}) {
  const store = await readStore();

  if (!store.llmSettings) {
    return null;
  }

  const nextSettings: StoredLLMSettings = {
    ...store.llmSettings,
    connectionStatus: input.ok ? "connected" : "failed",
    lastTestedAt: input.testedAt,
    lastTestError: input.ok ? null : input.error ?? "连接测试失败",
    updatedAt: new Date().toISOString()
  };

  await writeStore({ ...store, llmSettings: nextSettings });
  return nextSettings;
}

export async function getRuntimeLLMConfig(): Promise<RuntimeLLMConfig | null> {
  const settings = await getStoredLLMSettings();

  if (settings) {
    if (!settings.enabled) {
      return null;
    }

    const apiKey = safeDecrypt(settings.apiKey);

    if (apiKey) {
      return {
        source: "settings",
        apiKey,
        baseUrl: settings.baseUrl,
        model: settings.model
      };
    }

    if (envLLMConfigured() && process.env.OPENAI_API_KEY) {
      return {
        source: "env",
        apiKey: process.env.OPENAI_API_KEY,
        baseUrl: settings.baseUrl,
        model: settings.model
      };
    }
  }

  if (envLLMConfigured() && process.env.OPENAI_API_KEY) {
    return {
      source: "env",
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: getEnvBaseUrl(),
      model: getEnvModel()
    };
  }

  return null;
}

export async function getDecryptedStoredApiKey() {
  const settings = await getStoredLLMSettings();
  return safeDecrypt(settings?.apiKey ?? null);
}
