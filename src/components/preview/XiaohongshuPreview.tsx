import { Badge } from "@/components/ui/badge";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import type { PlatformContent } from "@/types";

export function XiaohongshuPreview({ content }: { content: PlatformContent }) {
  return (
    <article className="mx-auto max-w-[360px] overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-panel">
      <div className="grid aspect-[3/4] place-items-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 text-center">
        <div>
          <div className="text-sm font-medium text-rose-500">封面建议</div>
          <div className="mt-2 text-2xl font-semibold leading-8 text-gray-950">
            {content.imageSuggestions?.[0] ?? content.title}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h1 className="text-base font-semibold leading-6 text-gray-950">{content.title}</h1>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">{content.body}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(content.tags ?? []).map((tag) => (
            <Badge key={tag} className="border-rose-200 bg-rose-50 text-rose-700">
              {tag}
            </Badge>
          ))}
        </div>
        {content.interactionGuide ? (
          <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {content.interactionGuide}
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-gray-500">
          <span className="inline-flex items-center gap-3">
            <Heart className="h-4 w-4" />
            <MessageCircle className="h-4 w-4" />
            <Bookmark className="h-4 w-4" />
          </span>
          <span className="text-xs">1.2k</span>
        </div>
      </div>
    </article>
  );
}
