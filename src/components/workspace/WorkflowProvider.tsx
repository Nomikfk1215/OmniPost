"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode
} from "react";
import { validatePlatformContent } from "@/lib/validators";
import { createId } from "@/lib/utils";
import type {
  Platform,
  PlatformContent,
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

type Action =
  | { type: "UPDATE_RAW"; payload: Partial<RawContent> }
  | { type: "ADD_IMAGES"; payload: UploadedImage[] }
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

const emptySlots = PLATFORMS.reduce(
  (acc, platform) => ({
    ...acc,
    [platform]: { status: "idle", data: null }
  }),
  {} as Record<Platform, PlatformSlot>
);

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
  platformContents: emptySlots,
  activePlatformTab: "wechat",
  statusMessage: null,
  publishTask: null,
  publishStatus: "idle"
};

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
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
    case "REMOVE_IMAGE":
      return {
        ...state,
        rawContent: {
          ...state.rawContent,
          images: state.rawContent.images.filter((image) => image.id !== action.payload)
        }
      };
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
        statusMessage: "正在模拟发布..."
      };
    case "PUBLISH_SUCCESS":
      return {
        ...state,
        step: "publish",
        publishTask: action.payload,
        publishStatus: "success",
        statusMessage: "模拟发布成功"
      };
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
            "很多人在学习时没有计划，也不知道如何复盘。可以用 AI 帮助自己拆解学习目标、整理资料、生成每日学习计划，并在学习后生成复盘问题。\n\n这样可以提升学习效率，也能更快发现知识漏洞。关键不是让 AI 替你学习，而是让它成为学习流程里的辅助系统。",
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
  addImages: (files: FileList | null) => void;
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

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateRaw = useCallback((patch: Partial<RawContent>) => {
    dispatch({ type: "UPDATE_RAW", payload: patch });
  }, []);

  const addImages = useCallback((files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const images = Array.from(files).map((file) => ({
      id: createId("image"),
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    dispatch({ type: "ADD_IMAGES", payload: images });
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
      const createResponse = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: state.rawContent.title,
          rawText: state.rawContent.body,
          images: state.rawContent.images.map((image) => image.name),
          userTags: state.rawContent.userTags
        })
      });

      if (!createResponse.ok) {
        throw new Error("创建内容失败");
      }

      const { content } = (await createResponse.json()) as { content: { id: string } };
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
  }, [state.rawContent, state.settings]);

  const saveActiveContent = useCallback(async () => {
    const active = state.platformContents[state.activePlatformTab].data;

    if (!active) {
      dispatch({ type: "SET_STATUS", payload: "当前平台还没有适配内容" });
      return;
    }

    const response = await fetch(`/api/platform-contents/${active.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(active)
    });

    if (!response.ok) {
      dispatch({ type: "SET_STATUS", payload: "保存失败" });
      return;
    }

    const { content } = (await response.json()) as { content: PlatformContent };
    dispatch({
      type: "UPDATE_PLATFORM_CONTENT",
      payload: { platform: content.platform, patch: content }
    });
    dispatch({ type: "SET_STATUS", payload: "修改已保存" });
  }, [state.activePlatformTab, state.platformContents]);

  const publish = useCallback(async () => {
    const platformContents = state.settings.platforms
      .map((platform) => state.platformContents[platform].data)
      .filter(Boolean) as PlatformContent[];

    if (!state.contentId || platformContents.length === 0) {
      dispatch({ type: "SET_STATUS", payload: "请先完成平台适配" });
      return;
    }

    dispatch({ type: "PUBLISH_START" });

    try {
      const response = await fetch("/api/publish/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: state.contentId,
          title: state.rawContent.title || platformContents[0].title,
          platformContents
        })
      });

      if (!response.ok) {
        throw new Error("模拟发布失败");
      }

      const { task } = (await response.json()) as { task: PublishTask };
      dispatch({ type: "PUBLISH_SUCCESS", payload: task });
    } catch (error) {
      dispatch({
        type: "PUBLISH_ERROR",
        payload: error instanceof Error ? error.message : "模拟发布失败"
      });
    }
  }, [state.contentId, state.platformContents, state.rawContent.title, state.settings.platforms]);

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
