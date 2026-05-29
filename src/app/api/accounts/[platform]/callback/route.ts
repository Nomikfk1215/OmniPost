import { NextResponse } from "next/server";
import {
  connectPlatformAccount,
  markPlatformConnectionError
} from "@/lib/db/platform-accounts";
import { completeOAuthCallback } from "@/lib/platform-oauth";
import { PLATFORMS, type Platform } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isPlatform(value: string): value is Platform {
  return PLATFORMS.includes(value as Platform);
}

function accountsRedirect(requestUrl: string, params: Record<string, string>) {
  const url = new URL("/accounts", requestUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  if (!isPlatform(params.platform)) {
    return accountsRedirect(request.url, { accountError: "未知平台" });
  }

  const url = new URL(request.url);
  const providerError = url.searchParams.get("error") ?? url.searchParams.get("error_description");

  if (providerError) {
    await markPlatformConnectionError(params.platform, providerError);
    return accountsRedirect(request.url, { accountError: providerError });
  }

  try {
    const connection = await completeOAuthCallback(
      params.platform,
      url.searchParams.get("code"),
      url.searchParams.get("state")
    );
    const account = await connectPlatformAccount(params.platform, connection);

    return accountsRedirect(request.url, {
      connected: params.platform,
      accountName: account.accountName ?? ""
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "平台连接失败";
    await markPlatformConnectionError(params.platform, message);
    return accountsRedirect(request.url, { accountError: message });
  }
}
