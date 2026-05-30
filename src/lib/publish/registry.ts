import type { Platform } from "@/types";
import type { PlatformPublisher } from "./types";

const publishers = new Map<Platform, PlatformPublisher>();

export function registerPublisher(publisher: PlatformPublisher): void {
  publishers.set(publisher.platform, publisher);
}

export function getPublisher(
  platform: Platform
): PlatformPublisher | undefined {
  return publishers.get(platform);
}

export function hasRealPublisher(platform: Platform): boolean {
  return publishers.has(platform);
}

export function getPublishablePlatforms(): Platform[] {
  return Array.from(publishers.keys());
}
