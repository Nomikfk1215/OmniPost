"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode
} from "react";
import { collectContentImages } from "@/lib/images/assets";
import { validatePlatformContent } from "@/lib/validators";
import { createId } from "@/lib/utils";
import type {
  ImageAsset,
  Content,
  Platform,
  PlatformContent,
  PlatformImagePlan,
  PublishTask,
  RawContent,
  Step,
  StylePreset,
  UploadedImage,
  WorkspaceFormatting
} from "@/types";
import { PLATFORMS } from "@/types";

type PlatformSlot = {
  status: "idle" | "loading" | "ready" | "error";
  data: PlatformContent | null;
  error?: string;
};

type WorkspaceState = {
  step: Step;
  contentId: string | null;
  rawContent: RawContent;
  settings: {
    platforms: Platform[];
    stylePreset: StylePreset;
    formatting: WorkspaceFormatting;
  };
  platformContents: Record<Platform, PlatformSlot>;
  activePlatformTab: Platform;
  statusMessage: string | null;
  publishTask: PublishTask | null;
  publishStatus: "idle" | "publishing" | "success" | "error";
};

type WorkspacePersistedState = Pick<
  WorkspaceState,
  | "step"
  | "contentId"
  | "rawContent"
  | "settings"
  | "platformContents"
  | "activePlatformTab"
>;

type WorkspaceSnapshot = {
  version: 1;
  updatedAt: string;
  state: WorkspacePersistedState;
};

type Action =
  | { type: "RESTORE_SNAPSHOT"; payload: WorkspacePersistedState }
  | { type: "RESTORE_CONTENT"; payload: { content: Content; platformContents: PlatformContent[] } }
  | { type: "CONTENT_SAVED"; payload: { contentId: string } }
  | { type: "UPDATE_RAW"; payload: Partial<RawContent> }
  | { type: "ADD_IMAGES"; payload: UploadedImage[] }
  | { type: "REPLACE_IMAGES"; payload: { tempIds: string[]; images: UploadedImage[] } }
  | { type: "MARK_IMAGES_FAILED"; payload: string[] }
  | { type: "REMOVE_IMAGE"; payload: string }
  | { type: "SET_PLATFORMS"; payload: Platform[] }
  | { type: "SET_STYLE"; payload: StylePreset }
  | { type: "SET_FORMATTING"; payload: Partial<WorkspaceFormatting> }
  | { type: "SET_ACTIVE_PLATFORM"; payload: Platform }
  | { type: "START_GENERATION" }
  | { type: "GENERATION_SUCCESS"; payload: { contentId: string; outputs: PlatformContent[] } }
  | { type: "GENERATION_ERROR"; payload: string }
  | { type: "UPDATE_PLATFORM_CONTENT"; payload: { platform: Platform; patch: Partial<PlatformContent> } }
  | { type: "PUBLISH_START" }
  | { type: "PUBLISH_SUCCESS"; payload: PublishTask }
  | { type: "PUBLISH_ERROR"; payload: string }
  | { type: "SET_STATUS"; payload: string | null }
  | { type: "SET_SAMPLE" };

type AddImagesOptions = {
  onLocalImages?: (images: UploadedImage[]) => void;
};

const WORKSPACE_SNAPSHOT_KEY = "omnipost.workspace.snapshot.v1";

function createEmptyPlatformSlots() {
  return PLATFORMS.reduce(
    (acc, platform) => ({
      ...acc,
      [platform]: { status: "idle", data: null }
    }),
    {} as Record<Platform, PlatformSlot>
  );
}

const initialState: WorkspaceState = {
  step: "input",
  contentId: null,
  rawContent: {
    title: "",
    contentType: "tutorial",
    body: "",
    images: [],
    userTags: []
  },
  settings: {
    platforms: [...PLATFORMS],
    stylePreset: "casual",
    formatting: {
      titleStyle: "title",
      bodyStyle: "body",
      component: "image",
      emphasis: "bold"
    }
  },
  platformContents: createEmptyPlatformSlots(),
  activePlatformTab: "wechat",
  statusMessage: null,
  publishTask: null,
  publishStatus: "idle"
};

function stripUploadFields(image: UploadedImage): ImageAsset {
  const { uploadStatus, localPreviewUrl, ...asset } = image;
  return asset;
}

function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && PLATFORMS.includes(value as Platform);
}

function isContentType(value: unknown): value is RawContent["contentType"] {
  return value === "tutorial" || value === "article" || value === "note" || value === "campaign";
}

function normalizeRawContent(rawContent?: Partial<RawContent>): RawContent {
  return {
    title: typeof rawContent?.title === "string" ? rawContent.title : "",
    contentType: isContentType(rawContent?.contentType) ? rawContent.contentType : "tutorial",
    body: typeof rawContent?.body === "string" ? rawContent.body : "",
    images: Array.isArray(rawContent?.images) ? rawContent.images : [],
    userTags: Array.isArray(rawContent?.userTags)
      ? rawContent.userTags.filter((tag): tag is string => typeof tag === "string")
      : []
  };
}

function normalizeSettings(settings?: Partial<WorkspaceState["settings"]>) {
  const platforms = Array.isArray(settings?.platforms)
    ? settings.platforms.filter(isPlatform)
    : initialState.settings.platforms;

  return {
    platforms: platforms.length ? platforms : initialState.settings.platforms,
    stylePreset:
      settings?.stylePreset === "professional" || settings?.stylePreset === "casual"
        ? settings.stylePreset
        : initialState.settings.stylePreset,
    formatting: {
      ...initialState.settings.formatting,
      ...(settings?.formatting ?? {})
    }
  };
}

function createSlotsFromPlatformContents(contents: PlatformContent[]) {
  const slots = createEmptyPlatformSlots();

  contents.forEach((content) => {
    slots[content.platform] = {
      status: "ready",
      data: content
    };
  });

  return slots;
}

function normalizePlatformSlots(slots?: Partial<Record<Platform, PlatformSlot>>) {
  const normalized = createEmptyPlatformSlots();

  PLATFORMS.forEach((platform) => {
    const slot = slots?.[platform];

    if (slot?.data) {
      normalized[platform] = {
        status: "ready",
        data: slot.data
      };
    }
  });

  return normalized;
}

function hasReadyPlatformContent(slots: Record<Platform, PlatformSlot>) {
  return PLATFORMS.some((platform) => Boolean(slots[platform].data));
}

function rawContentFromContent(content: Content): RawContent {
  return {
    title: content.title ?? "",
    contentType: content.contentType ?? "tutorial",
    body: content.rawText,
    images: content.images.map((image) => ({ ...image, uploadStatus: "uploaded" })),
    userTags: content.userTags ?? []
  };
}

function hasDraftContent(rawContent: RawContent) {
  const text = rawContent.body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();

  return Boolean(
    rawContent.title.trim() ||
      text ||
      rawContent.images.length ||
      rawContent.userTags.length
  );
}

function sanitizeRawContentForPersistence(rawContent: RawContent): RawContent {
  return {
    ...rawContent,
    images: rawContent.images
      .filter((image) => image.uploadStatus !== "failed" && !image.url.startsWith("blob:"))
      .map((image) => ({ ...stripUploadFields(image), uploadStatus: "uploaded" }))
  };
}

function contentPayloadFromRaw(rawContent: RawContent) {
  const sanitized = sanitizeRawContentForPersistence(rawContent);

  return {
    title: sanitized.title,
    contentType: sanitized.contentType,
    rawText: sanitized.body,
    images: sanitized.images.map(stripUploadFields),
    userTags: sanitized.userTags
  };
}

function createWorkspaceSnapshot(state: WorkspaceState): WorkspaceSnapshot {
  const platformContents = createEmptyPlatformSlots();

  PLATFORMS.forEach((platform) => {
    const content = state.platformContents[platform].data;

    if (content) {
      platformContents[platform] = {
        status: "ready",
        data: content
      };
    }
  });

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    state: {
      step: state.step === "adapt" ? "preview" : state.step,
      contentId: state.contentId,
      rawContent: sanitizeRawContentForPersistence(state.rawContent),
      settings: state.settings,
      platformContents,
      activePlatformTab: state.activePlatformTab
    }
  };
}

function readWorkspaceSnapshot(): WorkspaceSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(WORKSPACE_SNAPSHOT_KEY);
    const parsed = raw ? (JSON.parse(raw) as WorkspaceSnapshot) : null;

    return parsed?.version === 1 && parsed.state ? parsed : null;
  } catch {
    return null;
  }
}

function writeWorkspaceSnapshot(state: WorkspaceState) {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.contentId && !hasDraftContent(state.rawContent) && !hasReadyPlatformContent(state.platformContents)) {
    window.localStorage.removeItem(WORKSPACE_SNAPSHOT_KEY);
    return;
  }

  window.localStorage.setItem(
    WORKSPACE_SNAPSHOT_KEY,
    JSON.stringify(createWorkspaceSnapshot(state))
  );
}

function syncWorkspaceUrl(contentId: string | null) {
  if (!contentId || typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (url.pathname !== "/workspace" || url.searchParams.get("contentId") === contentId) {
    return;
  }

  url.searchParams.set("contentId", contentId);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function toPublishableImageAssets(rawContent: RawContent): ImageAsset[] {
  const uploadedImages = rawContent.images
    .filter((image) => image.uploadStatus !== "failed")
    .map(stripUploadFields);

  return collectContentImages({
    rawText: rawContent.body,
    images: uploadedImages
  }).filter((image) => !image.url.startsWith("blob:"));
}

function replaceImageUrls(body: string, replacements: Array<{ from?: string; to?: string }>) {
  return replacements.reduce((nextBody, replacement) => {
    if (!replacement.from || !replacement.to || replacement.from === replacement.to) {
      return nextBody;
    }

    return nextBody.split(replacement.from).join(replacement.to);
  }, body);
}

function removeInlineImagesByUrl(body: string, urls: string[]) {
  const failedUrls = new Set(urls.filter(Boolean));

  if (!failedUrls.size) {
    return body;
  }

  return body
    .replace(
      /(?:\n{0,2})!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)(?:\n{0,2})/g,
      (match, url: string) => (failedUrls.has(url.trim()) ? "\n\n" : match)
    )
    .replace(
      /<figure\b[\s\S]*?<img\b[^>]*\ssrc=(["'])(.*?)\1[^>]*>[\s\S]*?<\/figure>/gi,
      (match, _quote: string, url: string) => (failedUrls.has(url.trim()) ? "" : match)
    )
    .replace(
      /<img\b[^>]*\ssrc=(["'])(.*?)\1[^>]*>/gi,
      (match, _quote: string, url: string) => (failedUrls.has(url.trim()) ? "" : match)
    )
    .replace(/\n{3,}/g, "\n\n");
}

function applyImagesToPlatformContent(
  content: PlatformContent,
  rawImages: ImageAsset[]
): PlatformContent {
  const retainedAssets = (content.imageAssets ?? []).filter(
    (asset) => asset.source !== "upload" && asset.source !== "markdown"
  );
  const imageAssets = [...rawImages, ...retainedAssets].filter(
    (asset, index, assets) =>
      assets.findIndex((candidate) => candidate.id === asset.id || candidate.url === asset.url) === index
  );
  const existingPlans = content.imagePlan ?? [];
  const nextAssetIds = new Set(imageAssets.map((asset) => asset.id));
  const rawAssetIds = new Set(rawImages.map((asset) => asset.id));
  const coverImages = rawImages.filter((asset) => asset.source !== "markdown");
  const inlineImages = rawImages.filter((asset) => asset.source === "markdown");

  const coverPlans: PlatformImagePlan[] = coverImages.map((asset, index) => ({
    role: index === 0 ? "cover" : "gallery",
    imageAssetId: asset.id,
    order: index,
    caption: asset.alt ?? asset.name
  }));
  const inlinePlans: PlatformImagePlan[] = inlineImages.map((asset, index) => ({
    role: "inline",
    imageAssetId: asset.id,
    order: coverPlans.length + index,
    caption: asset.alt ?? asset.name
  }));
  const retainedPlans = existingPlans
    .filter(
      (plan) =>
        nextAssetIds.has(plan.imageAssetId) &&
        !rawAssetIds.has(plan.imageAssetId) &&
        !(coverPlans.length > 0 && plan.role === "cover")
    )
    .map((plan, index) => ({
      ...plan,
      order: coverPlans.length + inlinePlans.length + index
    }));

  return {
    ...content,
    imageAssets,
    imagePlan: [...coverPlans, ...inlinePlans, ...retainedPlans],
    updatedAt: new Date().toISOString()
  };
}

function syncImagesIntoReadySlots(
  slots: Record<Platform, PlatformSlot>,
  rawContent: RawContent
) {
  const images = toPublishableImageAssets(rawContent);

  return PLATFORMS.reduce((nextSlots, platform) => {
    const slot = slots[platform];

    if (!slot.data) {
      nextSlots[platform] = slot;
      return nextSlots;
    }

    nextSlots[platform] = {
      ...slot,
      data: applyImagesToPlatformContent(slot.data, images)
    };
    return nextSlots;
  }, {} as Record<Platform, PlatformSlot>);
}

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case "RESTORE_SNAPSHOT": {
      const platformContents = normalizePlatformSlots(action.payload.platformContents);
      const hasPlatformContent = hasReadyPlatformContent(platformContents);
      const settings = normalizeSettings(action.payload.settings);
      const activePlatformTab = isPlatform(action.payload.activePlatformTab)
        ? action.payload.activePlatformTab
        : settings.platforms[0];

      return {
        ...state,
        step: hasPlatformContent
          ? action.payload.step === "adapt" || action.payload.step === "publish"
            ? "preview"
            : action.payload.step
          : "input",
        contentId: action.payload.contentId ?? null,
        rawContent: normalizeRawContent(action.payload.rawContent),
        settings,
        platformContents,
        activePlatformTab,
        publishTask: null,
        publishStatus: "idle",
        statusMessage: "已恢复上次工作区草稿"
      };
    }
    case "RESTORE_CONTENT": {
      const platformContents = createSlotsFromPlatformContents(action.payload.platformContents);
      const restoredPlatforms = Array.from(
        new Set(action.payload.platformContents.map((content) => content.platform))
      );
      const settings = {
        ...state.settings,
        platforms: restoredPlatforms.length ? restoredPlatforms : state.settings.platforms
      };

      return {
        ...state,
        step: action.payload.platformContents.length ? "preview" : "input",
        contentId: action.payload.content.id,
        rawContent: rawContentFromContent(action.payload.content),
        settings,
        platformContents,
        activePlatformTab: restoredPlatforms[0] ?? state.activePlatformTab,
        publishTask: null,
        publishStatus: "idle",
        statusMessage: "已恢复保存的工作区内容"
      };
    }
    case "CONTENT_SAVED":
      return {
        ...state,
        contentId: action.payload.contentId
      };
    case "UPDATE_RAW":
      return {
        ...state,
        rawContent: { ...state.rawContent, ...action.payload },
        statusMessage: null
      };
    case "ADD_IMAGES":
      return {
        ...state,
        rawContent: {
          ...state.rawContent,
          images: [...state.rawContent.images, ...action.payload]
        }
      };
    case "REPLACE_IMAGES": {
      const tempIds = new Set(action.payload.tempIds);
      const replacementByTempId = new Map(
        action.payload.tempIds.map((id, index) => [id, action.payload.images[index]])
      );
      const replacements = state.rawContent.images
        .filter((image) => tempIds.has(image.id))
        .map((image) => ({
          from: image.localPreviewUrl ?? image.url,
          to: replacementByTempId.get(image.id)?.url
        }));
      const images = state.rawContent.images.flatMap((image) => {
        if (!tempIds.has(image.id)) {
          return [image];
        }

        const replacement = replacementByTempId.get(image.id);
        return replacement ? [replacement] : [];
      });
      const rawContent = {
        ...state.rawContent,
        body: replaceImageUrls(state.rawContent.body, replacements),
        images
      };

      return {
        ...state,
        rawContent,
        platformContents: syncImagesIntoReadySlots(state.platformContents, rawContent)
      };
    }
    case "MARK_IMAGES_FAILED": {
      const failedIds = new Set(action.payload);
      const failedUrls = state.rawContent.images
        .filter((image) => failedIds.has(image.id))
        .flatMap((image) => [image.localPreviewUrl, image.url])
        .filter((url): url is string => Boolean(url));
      const images = state.rawContent.images.map((image) =>
        failedIds.has(image.id) ? { ...image, uploadStatus: "failed" as const } : image
      );
      const rawContent = {
        ...state.rawContent,
        body: removeInlineImagesByUrl(state.rawContent.body, failedUrls),
        images
      };

      return {
        ...state,
        rawContent,
        platformContents: syncImagesIntoReadySlots(state.platformContents, rawContent),
        statusMessage: "图片上传失败，请重新选择图片"
      };
    }
    case "REMOVE_IMAGE": {
      const images = state.rawContent.images.filter((image) => image.id !== action.payload);
      const rawContent = {
        ...state.rawContent,
        images
      };

      return {
        ...state,
        rawContent,
        platformContents: syncImagesIntoReadySlots(state.platformContents, rawContent)
      };
    }
    case "SET_PLATFORMS": {
      const nextPlatforms = action.payload.length ? action.payload : state.settings.platforms;
      const activePlatformTab = nextPlatforms.includes(state.activePlatformTab)
        ? state.activePlatformTab
        : nextPlatforms[0];

      return {
        ...state,
        settings: { ...state.settings, platforms: nextPlatforms },
        activePlatformTab
      };
    }
    case "SET_STYLE":
      return {
        ...state,
        settings: { ...state.settings, stylePreset: action.payload }
      };
    case "SET_FORMATTING":
      return {
        ...state,
        settings: {
          ...state.settings,
          formatting: { ...state.settings.formatting, ...action.payload }
        },
        statusMessage: "排版样式已更新"
      };
    case "SET_ACTIVE_PLATFORM":
      return {
        ...state,
        activePlatformTab: action.payload
      };
    case "START_GENERATION": {
      const nextSlots = { ...state.platformContents };
      state.settings.platforms.forEach((platform) => {
        nextSlots[platform] = { ...nextSlots[platform], status: "loading", error: undefined };
      });

      return {
        ...state,
        step: "adapt",
        platformContents: nextSlots,
        statusMessage: "正在进行平台适配...",
        publishStatus: "idle"
      };
    }
    case "GENERATION_SUCCESS": {
      const nextSlots = { ...state.platformContents };
      action.payload.outputs.forEach((content) => {
        nextSlots[content.platform] = {
          status: "ready",
          data: content
        };
      });

      return {
        ...state,
        step: "preview",
        contentId: action.payload.contentId,
        platformContents: nextSlots,
        activePlatformTab: action.payload.outputs[0]?.platform ?? state.activePlatformTab,
        statusMessage: "平台版本已适配",
        publishTask: null,
        publishStatus: "idle"
      };
    }
    case "GENERATION_ERROR": {
      const nextSlots = { ...state.platformContents };
      state.settings.platforms.forEach((platform) => {
        nextSlots[platform] = {
          ...nextSlots[platform],
          status: "error",
          error: action.payload
        };
      });

      return {
        ...state,
        platformContents: nextSlots,
        statusMessage: action.payload
      };
    }
    case "UPDATE_PLATFORM_CONTENT": {
      const slot = state.platformContents[action.payload.platform];

      if (!slot.data) {
        return state;
      }

      const updated = {
        ...slot.data,
        ...action.payload.patch,
        updatedAt: new Date().toISOString()
      };
      updated.validation = validatePlatformContent(updated);

      return {
        ...state,
        platformContents: {
          ...state.platformContents,
          [action.payload.platform]: {
            status: "ready",
            data: updated
          }
        },
        publishStatus: "idle",
        statusMessage: null
      };
    }
    case "PUBLISH_START":
      return {
        ...state,
        publishStatus: "publishing",
        statusMessage: "正在发布..."
      };
    case "PUBLISH_SUCCESS": {
      const attentionResults = action.payload.results.filter(
        (result) => result.status !== "success"
      );
      const failedResults = action.payload.results.filter(
        (result) => result.status === "failed"
      );
      const firstMessage = attentionResults.find((result) => result.message)?.message;
      const publishSucceeded = failedResults.length === 0;
      const statusMessage = (() => {
        if (action.payload.status === "success") {
          return action.payload.mode === "real" ? "发布提交成功" : "模拟发布成功";
        }
        if (action.payload.status === "drafted") {
          return "已创建草稿，需手动发布";
        }
        if (action.payload.status === "assist") {
          return "已生成辅助发布包";
        }
        if (publishSucceeded) {
          return "已完成发布处理，部分平台需要手动辅助";
        }
        if (firstMessage) {
          return "发布未完成，查看发布面板详情";
        }
        return action.payload.status === "partial"
          ? "部分平台发布失败，查看发布面板详情"
          : "发布失败";
      })();

      return {
        ...state,
        step: "publish",
        publishTask: action.payload,
        publishStatus: publishSucceeded ? "success" : "error",
        statusMessage
      };
    }
    case "PUBLISH_ERROR":
      return {
        ...state,
        publishStatus: "error",
        statusMessage: action.payload
      };
    case "SET_STATUS":
      return {
        ...state,
        statusMessage: action.payload
      };
    case "SET_SAMPLE":
      return {
        ...state,
        rawContent: {
          ...state.rawContent,
          title: "如何用 AI 提升学习效率",
          contentType: "tutorial",
          body:
            "<p>很多人在学习时没有计划，也不知道如何复盘。可以用 AI 帮助自己拆解学习目标、整理资料、生成每日学习计划，并在学习后生成复盘问题。</p><p>这样可以提升学习效率，也能更快发现知识漏洞。关键不是让 AI 替你学习，而是让它成为学习流程里的辅助系统。</p>",
          userTags: ["AI", "学习效率", "方法论"]
        },
        statusMessage: null
      };
    default:
      return state;
  }
}

type WorkflowContextValue = {
  state: WorkspaceState;
  generate: () => Promise<void>;
  publish: () => Promise<void>;
  saveActiveContent: () => Promise<void>;
  updateRaw: (patch: Partial<RawContent>) => void;
  addImages: (files: FileList | null, options?: AddImagesOptions) => void;
  removeImage: (id: string) => void;
  setPlatforms: (platforms: Platform[]) => void;
  setStylePreset: (stylePreset: StylePreset) => void;
  setFormatting: (patch: Partial<WorkspaceFormatting>) => void;
  setActivePlatform: (platform: Platform) => void;
  updatePlatformContent: (platform: Platform, patch: Partial<PlatformContent>) => void;
  setStatus: (message: string | null) => void;
  loadSample: () => void;
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({
  children,
  initialContentId
}: {
  children: ReactNode;
  initialContentId?: string;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isReady, setIsReady] = useState(false);
  const lastAutoSavedContentRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function restoreWorkspace() {
      if (initialContentId) {
        try {
          const response = await fetch(`/api/contents/${initialContentId}`);

          if (!response.ok) {
            throw new Error("restore failed");
          }

          const payload = (await response.json()) as {
            content: Content;
            platformContents?: PlatformContent[];
          };

          if (!cancelled) {
            dispatch({
              type: "RESTORE_CONTENT",
              payload: {
                content: payload.content,
                platformContents: payload.platformContents ?? []
              }
            });
          }
        } catch {
          if (!cancelled) {
            const snapshot = readWorkspaceSnapshot();

            if (snapshot) {
              dispatch({ type: "RESTORE_SNAPSHOT", payload: snapshot.state });
            } else {
              dispatch({ type: "SET_STATUS", payload: "未能恢复指定内容" });
            }
          }
        } finally {
          if (!cancelled) {
            setIsReady(true);
          }
        }
        return;
      }

      const snapshot = readWorkspaceSnapshot();

      if (!cancelled && snapshot) {
        dispatch({ type: "RESTORE_SNAPSHOT", payload: snapshot.state });
      }

      if (!cancelled) {
        setIsReady(true);
      }
    }

    void restoreWorkspace();

    return () => {
      cancelled = true;
    };
  }, [initialContentId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    writeWorkspaceSnapshot(state);
  }, [isReady, state]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    syncWorkspaceUrl(state.contentId);
  }, [isReady, state.contentId]);

  useEffect(() => {
    if (!isReady || !state.contentId || !hasDraftContent(state.rawContent)) {
      return;
    }

    const payload = contentPayloadFromRaw(state.rawContent);
    const snapshot = JSON.stringify({ contentId: state.contentId, payload });

    if (lastAutoSavedContentRef.current === snapshot) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetch(`/api/contents/${state.contentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then((response) => {
        if (response.ok) {
          lastAutoSavedContentRef.current = snapshot;
        }
      }).catch(() => undefined);
    }, 1200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isReady, state.contentId, state.rawContent]);

  const updateRaw = useCallback((patch: Partial<RawContent>) => {
    dispatch({ type: "UPDATE_RAW", payload: patch });
  }, []);

  const addImages = useCallback((files: FileList | null, options?: AddImagesOptions) => {
    if (!files?.length) {
      return;
    }

    const fileList = Array.from(files);
    const images = fileList.map((file) => {
      const previewUrl = URL.createObjectURL(file);

      return {
        id: createId("image"),
        source: "upload" as const,
        name: file.name,
        url: previewUrl,
        mimeType: file.type || undefined,
        size: file.size,
        createdAt: new Date().toISOString(),
        uploadStatus: "local" as const,
        localPreviewUrl: previewUrl
      };
    });
    dispatch({ type: "ADD_IMAGES", payload: images });
    options?.onLocalImages?.(images);

    const formData = new FormData();
    fileList.forEach((file) => formData.append("files", file));

    void fetch("/api/uploads", {
      method: "POST",
      body: formData
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("upload failed");
        }

        return (await response.json()) as { images: UploadedImage[] };
      })
      .then((payload) => {
        images.forEach((image) => URL.revokeObjectURL(image.url));
        dispatch({
          type: "REPLACE_IMAGES",
          payload: {
            tempIds: images.map((image) => image.id),
            images: payload.images.map((image) => ({ ...image, uploadStatus: "uploaded" }))
          }
        });
      })
      .catch(() => {
        dispatch({ type: "MARK_IMAGES_FAILED", payload: images.map((image) => image.id) });
      });
  }, []);

  const removeImage = useCallback((id: string) => {
    dispatch({ type: "REMOVE_IMAGE", payload: id });
  }, []);

  const setPlatforms = useCallback((platforms: Platform[]) => {
    dispatch({ type: "SET_PLATFORMS", payload: platforms });
  }, []);

  const setStylePreset = useCallback((stylePreset: StylePreset) => {
    dispatch({ type: "SET_STYLE", payload: stylePreset });
  }, []);

  const setFormatting = useCallback((patch: Partial<WorkspaceFormatting>) => {
    dispatch({ type: "SET_FORMATTING", payload: patch });
  }, []);

  const setActivePlatform = useCallback((platform: Platform) => {
    dispatch({ type: "SET_ACTIVE_PLATFORM", payload: platform });
  }, []);

  const updatePlatformContent = useCallback((platform: Platform, patch: Partial<PlatformContent>) => {
    dispatch({ type: "UPDATE_PLATFORM_CONTENT", payload: { platform, patch } });
  }, []);

  const loadSample = useCallback(() => {
    dispatch({ type: "SET_SAMPLE" });
  }, []);

  const setStatus = useCallback((message: string | null) => {
    dispatch({ type: "SET_STATUS", payload: message });
  }, []);

  const generate = useCallback(async () => {
    if (!state.rawContent.body.trim()) {
      dispatch({ type: "SET_STATUS", payload: "请先填写正文" });
      return;
    }

    dispatch({ type: "START_GENERATION" });

    try {
      const contentPayload = contentPayloadFromRaw(state.rawContent);
      const saveResponse = await fetch(state.contentId ? `/api/contents/${state.contentId}` : "/api/contents", {
        method: state.contentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentPayload)
      });

      if (!saveResponse.ok) {
        throw new Error("保存原始内容失败");
      }

      const { content } = (await saveResponse.json()) as { content: Content };
      lastAutoSavedContentRef.current = JSON.stringify({
        contentId: content.id,
        payload: contentPayload
      });
      dispatch({ type: "CONTENT_SAVED", payload: { contentId: content.id } });
      const generateResponse = await fetch(`/api/contents/${content.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: state.settings.platforms,
          stylePreset: state.settings.stylePreset
        })
      });

      if (!generateResponse.ok) {
        const payload = (await generateResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "平台适配失败");
      }

      const { outputs } = (await generateResponse.json()) as { outputs: PlatformContent[] };
      dispatch({ type: "GENERATION_SUCCESS", payload: { contentId: content.id, outputs } });
    } catch (error) {
      dispatch({
        type: "GENERATION_ERROR",
        payload: error instanceof Error ? error.message : "适配失败"
      });
    }
  }, [state.contentId, state.rawContent, state.settings]);

  const saveActiveContent = useCallback(async () => {
    const active = state.platformContents[state.activePlatformTab].data;

    if (!hasDraftContent(state.rawContent) && !active) {
      dispatch({ type: "SET_STATUS", payload: "请先填写草稿内容" });
      return;
    }

    try {
      const contentPayload = contentPayloadFromRaw(state.rawContent);
      const contentResponse = await fetch(state.contentId ? `/api/contents/${state.contentId}` : "/api/contents", {
        method: state.contentId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentPayload)
      });

      if (!contentResponse.ok) {
        throw new Error("保存原始草稿失败");
      }

      const { content: savedContent } = (await contentResponse.json()) as { content: Content };
      lastAutoSavedContentRef.current = JSON.stringify({
        contentId: savedContent.id,
        payload: contentPayload
      });
      dispatch({ type: "CONTENT_SAVED", payload: { contentId: savedContent.id } });

      if (!active) {
        dispatch({ type: "SET_STATUS", payload: "草稿已保存" });
        return;
      }

      const response = await fetch(`/api/platform-contents/${active.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(active)
      });

      if (!response.ok) {
        throw new Error("保存平台内容失败");
      }

      const { content } = (await response.json()) as { content: PlatformContent };
      dispatch({
        type: "UPDATE_PLATFORM_CONTENT",
        payload: { platform: content.platform, patch: content }
      });
      dispatch({ type: "SET_STATUS", payload: "草稿和当前平台版本已保存" });
    } catch (error) {
      dispatch({
        type: "SET_STATUS",
        payload: error instanceof Error ? error.message : "保存失败"
      });
    }
  }, [state.activePlatformTab, state.contentId, state.platformContents, state.rawContent]);

  const publish = useCallback(async () => {
    const platformContents = state.settings.platforms
      .map((platform) => state.platformContents[platform].data)
      .filter(Boolean) as PlatformContent[];
    const publishableImages = toPublishableImageAssets(state.rawContent);
    const platformContentsForPublish = platformContents.map((content) =>
      applyImagesToPlatformContent(content, publishableImages)
    );

    if (!state.contentId || platformContents.length === 0) {
      dispatch({ type: "SET_STATUS", payload: "请先完成平台适配" });
      return;
    }

    dispatch({ type: "PUBLISH_START" });

    try {
      const response = await fetch("/api/publish/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: state.contentId,
          title: state.rawContent.title || platformContents[0].title,
          mode: "real",
          platformContents: platformContentsForPublish
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "发布失败");
      }

      const { task } = (await response.json()) as { task: PublishTask };
      dispatch({ type: "PUBLISH_SUCCESS", payload: task });
    } catch (error) {
      dispatch({
        type: "PUBLISH_ERROR",
        payload: error instanceof Error ? error.message : "发布失败"
      });
    }
  }, [
    state.contentId,
    state.platformContents,
    state.rawContent,
    state.settings.platforms
  ]);

  const value = useMemo(
    () => ({
      state,
      generate,
      publish,
      saveActiveContent,
      updateRaw,
      addImages,
      removeImage,
      setPlatforms,
      setStylePreset,
      setFormatting,
      setActivePlatform,
      updatePlatformContent,
      setStatus,
      loadSample
    }),
    [
      state,
      generate,
      publish,
      saveActiveContent,
      updateRaw,
      addImages,
      removeImage,
      setPlatforms,
      setStylePreset,
      setFormatting,
      setActivePlatform,
      updatePlatformContent,
      setStatus,
      loadSample
    ]
  );

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);

  if (!context) {
    throw new Error("useWorkflow must be used within WorkflowProvider");
  }

  return context;
}
