export const PLATFORMS = ["wechat", "zhihu", "xiaohongshu", "bilibili"] as const;

export type Platform = (typeof PLATFORMS)[number];

export type PublishCapability = "real" | "mock" | "assist";

export type AccountConnectionMethod = "manual" | "oauth";

export type PlatformAccount = {
  platform: Platform;
  authorized: boolean;
  publishCapability: PublishCapability;
  accountName: string | null;
  externalAccountId: string | null;
  connectionMethod: AccountConnectionMethod | null;
  connectedAt: string | null;
  tokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  scopes: string[];
  lastConnectionError: string | null;
  oauthSupported?: boolean;
  oauthConfigured?: boolean;
  oauthHint?: string;
};

export type StoredPlatformAccount = PlatformAccount & {
  encryptedAccessToken: string | null;
  encryptedRefreshToken: string | null;
};

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

export type ImageAssetSource = "upload" | "markdown" | "generated" | "search";

export type ImageAsset = {
  id: string;
  source: ImageAssetSource;
  name: string;
  url: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  size?: number;
  alt?: string;
  prompt?: string;
  searchQuery?: string;
  attribution?: string;
  createdAt: string;
};

export type UploadedImage = ImageAsset & {
  uploadStatus?: "local" | "uploaded" | "failed";
  localPreviewUrl?: string;
};

export type PlatformImagePlan = {
  role: "cover" | "gallery" | "inline" | "meme";
  imageAssetId: string;
  order: number;
  title?: string;
  caption?: string;
};

export type Content = {
  id: string;
  title?: string;
  rawText: string;
  images: ImageAsset[];
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
  images: ImageAsset[];
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
  imageAssets?: ImageAsset[];
  imagePlan?: PlatformImagePlan[];
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
  message?: string;
};

export type PublishMode = "mock" | "real";

export type PublishTaskStatus =
  | "pending"
  | "publishing"
  | "success"
  | "failed"
  | "partial";

export type PublishTask = {
  id: string;
  contentId: string;
  title: string;
  mode: PublishMode;
  status: PublishTaskStatus;
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

// === Platform Credential types ===

export type CredentialPlatform = Platform;

export type CredentialFieldDef = {
  key: string;
  label: string;
  secret: boolean;
  placeholder: string;
};

export type StoredPlatformCredential = {
  platform: CredentialPlatform;
  credentials: Record<string, string | null>;
  addedAt: string;
  updatedAt: string;
};

export type PublicPlatformCredential = {
  platform: CredentialPlatform;
  configured: boolean;
  maskedFields: Record<string, string | null>;
  addedAt: string;
  updatedAt: string;
};
