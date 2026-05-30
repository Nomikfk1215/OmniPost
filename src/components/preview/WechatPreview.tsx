import Image from "next/image";
import { sanitizePreviewHtml } from "./sanitize";
import type { PlatformContent } from "@/types";
import { getCoverPreviewImage } from "./image-assets";

export function WechatPreview({ content }: { content: PlatformContent }) {
  const coverImage = getCoverPreviewImage(content);

  return (
    <article className="mx-auto max-w-[430px] rounded-md border border-gray-200 bg-white p-5 shadow-panel">
      <h1 className="text-xl font-semibold leading-8 text-gray-950">{content.title}</h1>
      <div className="mt-2 text-xs text-gray-400">OmniPost · 刚刚</div>
      <div className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
        {content.digest ?? "摘要待补充"}
      </div>
      {coverImage ? (
        <div className="mt-4 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          <Image
            src={coverImage.asset.url}
            alt={coverImage.asset.alt ?? coverImage.asset.name}
            width={coverImage.asset.width ?? 1200}
            height={coverImage.asset.height ?? 600}
            className="aspect-[2/1] w-full object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="mt-4 grid aspect-[2/1] place-items-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 text-center text-sm leading-6 text-gray-500">
          {content.coverSuggestion ?? "封面图占位"}
        </div>
      )}
      <div
        className="mt-5 space-y-3 text-sm leading-7 text-gray-800 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 [&_h2]:mt-4 [&_h2]:font-semibold [&_h2]:text-gray-950 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-gray-950"
        dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(content.html ?? content.body) }}
      />
    </article>
  );
}
