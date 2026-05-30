export const PLATFORMS = ["wechat", "zhihu", "xiaohongshu", "bilibili"] as const;

export type Platform = (typeof PLATFORMS)[number];

export type StylePreset = "casual" | "professional";

export type Step = "input" | "adapt" | "preview" | "publish";

export type ContentType = "tutorial" | "article" | "note" | "campaign";

export type WorkspaceFormatting = {
  titleStyle: "title" | "subtitle" | "heading";
  bodyStyle: "body" | "quote" | "list";
  component: "image" | "divider" | "qrcode";
  emphasis: "bold" | "color" | "background";
};

export type RawContent = {
  title: string;
  contentType: ContentType;
  body: string;
  images: UploadedImage[];
  userTags: string[];
};

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

export type Content = {
  id: string;
  title?: string;
  rawText: string;
  images: string[];
  userTags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type UnifiedContent = {
  id: string;
  title: string;
  summary: string;
  body: Array<{
    type: "heading" | "paragraph" | "image";
    content: string;
  }>;
  images: string[];
  tags: string[];
};

export type ValidationLevel = "pass" | "warning" | "error";

export type ValidationCheck = {
  id: string;
  level: ValidationLevel;
  message: string;
};

export type ValidationResult = {
  passed: boolean;
  level: ValidationLevel;
  warnings: string[];
  checks: ValidationCheck[];
};

export type PlatformContent = {
  id: string;
  contentId: string;
  platform: Platform;
  generationSource?: "llm" | "mock";
  title: string;
  body: string;
  summary?: string;
  digest?: string;
  description?: string;
  openingConclusion?: string;
  html?: string;
  tags?: string[];
  imageSuggestions?: string[];
  coverSuggestion?: string;
  interactionGuide?: string;
  categorySuggestion?: string;
  validation: ValidationResult;
  createdAt: string;
  updatedAt: string;
};

export type PublishResult = {
  id: string;
  platform: Platform;
  platformContentId: string;
  status: "success" | "failed";
  url: string;
};

export type PublishTask = {
  id: string;
  contentId: string;
  title: string;
  mode: "mock";
  status: "pending" | "publishing" | "success" | "failed";
  results: PublishResult[];
  createdAt: string;
  finishedAt?: string;
};

export type PlatformGenerationRequest = {
  platforms: Platform[];
  stylePreset: StylePreset;
};

export type LLMConnectionStatus = "unknown" | "connected" | "failed";

export type StoredLLMSettings = {
  provider: "openai-compatible";
  apiKey: string | null;
  baseUrl: string;
  model: string;
  enabled: boolean;
  connectionStatus: LLMConnectionStatus;
  lastTestedAt: string | null;
  lastTestError: string | null;
  updatedAt: string;
};

export type LLMRuntimeMode = "ui" | "env" | "mock" | "disabled";

export type PublicLLMSettings = {
  configured: boolean;
  maskedKey: string | null;
  baseUrl: string;
  model: string;
  enabled: boolean;
  connectionStatus: LLMConnectionStatus;
  lastTestedAt: string | null;
  lastTestError: string | null;
  mode: LLMRuntimeMode;
  envConfigured: boolean;
  updatedAt: string | null;
};

export type PlatformInfo = {
  id: Platform;
  label: string;
  shortLabel: string;
  tone: string;
  accentClass: string;
};

export type PlatformSkill = {
  platform: Platform;
  displayName: string;
  positioning: string;
  titleRule: Record<string, unknown>;
  bodyRule: Record<string, unknown>;
  tagRule?: Record<string, unknown>;
  imageRule?: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  editableFields: string[];
};
