import { NextResponse } from "next/server";
import {
  buildOAuthConnectUrl,
  getOAuthProviderStatus
} from "@/lib/platform-oauth";
import { PLATFORMS, type Platform } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isPlatform(value: string): value is Platform {
  return PLATFORMS.includes(value as Platform);
}

function accountsRedirect(requestUrl: string, key: "accountError", value: string) {
  const url = new URL("/accounts", requestUrl);
  url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  if (!isPlatform(params.platform)) {
    return accountsRedirect(request.url, "accountError", "未知平台");
  }

  try {
    return NextResponse.redirect(buildOAuthConnectUrl(params.platform, request.url));
  } catch (error) {
    const fallback = getOAuthProviderStatus(params.platform).hint;
    return accountsRedirect(
      request.url,
      "accountError",
      error instanceof Error ? error.message : fallback
    );
  }
}
