"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAssistCopyPayload } from "@/lib/publish/assist-copy";
import { copyPlatformContentAsRichText } from "@/lib/publish/clipboard";
import type { PlatformContent } from "@/types";

export function AssistCopyPanel({ content }: { content: PlatformContent }) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const copyPayload = useMemo(
    () =>
      buildAssistCopyPayload(
        content,
        typeof window === "undefined" ? undefined : window.location.origin
      ),
    [content]
  );

  async function copyPackage() {
    setCopying(true);
    try {
      await copyPlatformContentAsRichText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } finally {
      setCopying(false);
    }
  }

  return (
    <section className="panel h-fit rounded-md p-4">
      <h2 className="text-sm font-semibold text-gray-950">辅助发布包</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        这个平台没有可用的直发接口时，直接复制下面这份内容到平台创作后台。
      </p>
      <Button className="mt-4 w-full" onClick={copyPackage} disabled={copying}>
        {copied ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {copying ? "正在处理图片" : copied ? "已复制" : "一键复制发布包"}
      </Button>
      <pre className="mt-4 max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-gray-100 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
        {copyPayload.text}
      </pre>
    </section>
  );
}
