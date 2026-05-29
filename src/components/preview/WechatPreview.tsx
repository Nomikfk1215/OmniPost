import { Badge } from "@/components/ui/badge";
import { sanitizePreviewHtml } from "./sanitize";
import type { PlatformContent } from "@/types";

export function WechatPreview({ content }: { content: PlatformContent }) {
  return (
    <article className="mx-auto max-w-[430px] rounded-md border border-gray-200 bg-white p-5 shadow-panel">
      <h1 className="text-xl font-semibold leading-8 text-gray-950">{content.title}</h1>
      <div className="mt-2 text-xs text-gray-400">OmniPost · 刚刚</div>
      <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
        {content.digest ?? "摘要待补充"}
      </div>
      <div className="mt-4 grid aspect-[2/1] place-items-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        {content.coverSuggestion ?? "封面图占位"}
      </div>
      <div
        className="mt-5 space-y-3 text-sm leading-7 text-gray-800 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 [&_h2]:mt-4 [&_h2]:font-semibold [&_h2]:text-gray-950 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-gray-950"
        dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(content.html ?? content.body) }}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {(content.imageSuggestions ?? []).map((item) => (
          <Badge key={item} className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {item}
          </Badge>
        ))}
      </div>
    </article>
  );
}
