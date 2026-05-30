import type { Platform, PlatformContent } from "@/types";

export interface PublishRequest {
  contentId: string;
  title: string;
  platformContent: PlatformContent;
  credentials: Record<string, string>;
}

export interface PublishResponse {
  platform: Platform;
  platformContentId: string;
  status: "success" | "failed" | "drafted";
  url: string;
  error?: string;
  message?: string;
}

export interface PlatformPublisher {
  readonly platform: Platform;
  publish(request: PublishRequest): Promise<PublishResponse>;
}
