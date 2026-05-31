import type { Platform, PlatformContent } from "@/types";
import type { PlatformPublishAuth } from "./auth";

export interface PublishRequest {
  contentId: string;
  title: string;
  platformContent: PlatformContent;
  credentials: Record<string, string>;
  auth: PlatformPublishAuth;
}

export interface PublishResponse {
  platform: Platform;
  platformContentId: string;
  status: "success" | "failed" | "drafted" | "assist";
  url: string;
  error?: string;
  message?: string;
}

export interface PlatformPublisher {
  readonly platform: Platform;
  publish(request: PublishRequest): Promise<PublishResponse>;
}
