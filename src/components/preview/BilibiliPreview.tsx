import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp } from "lucide-react";
import { getCoverPreviewImage } from "./image-assets";
import { MarkdownBody } from "./MarkdownBody";
import type { PlatformContent } from "@/types";

export function BilibiliPreview({ content }: { content: PlatformContent }) {
  const coverImage = getCoverPreviewImage(content);

  return (
    <article className="mx-auto max-w-[520px] rounded-md border border-gray-200 bg-white p-5 shadow-panel">
      {coverImage ? (
        <div className="overflow-hidden rounded-md border border-sky-100 bg-sky-50">
          <Image
            src={coverImage.asset.url}
            alt={coverImage.asset.alt ?? coverImage.asset.name}
            width={coverImage.asset.width ?? 1280}
            height={coverImage.asset.height ?? 720}
            className="aspect-video w-full object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
          {content.coverSuggestion ?? "专栏封面建议"}
        </div>
      )}
      <h1 className="mt-4 text-xl font-semibold leading-8 text-gray-950">{content.title}</h1>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 font-semibold text-sky-700">
          UP
        </span>
        <span>OmniPost 创作者</span>
        {content.categorySuggestion ? (
          <Badge className="border-sky-200 bg-sky-50 text-sky-700">
            {content.categorySuggestion}
          </Badge>
        ) : null}
      </div>
      <p className="mt-4 rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-700">
        {content.description}
      </p>
      <div className="mt-4 text-gray-800">
        <MarkdownBody text={content.body} variant="bilibili" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {(content.tags ?? []).map((tag) => (
          <Badge key={tag} className="border-sky-200 bg-sky-50 text-sky-700">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          点赞
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="h-4 w-4" />
          收藏
        </span>
      </div>
    </article>
  );
}
