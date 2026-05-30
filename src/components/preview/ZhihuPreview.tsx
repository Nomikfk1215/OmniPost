import { Badge } from "@/components/ui/badge";
import { ThumbsUp } from "lucide-react";
import { MarkdownBody } from "./MarkdownBody";
import type { PlatformContent } from "@/types";

export function ZhihuPreview({ content }: { content: PlatformContent }) {
  return (
    <article className="mx-auto max-w-[500px] rounded-md border border-gray-200 bg-white p-5 shadow-panel">
      <h1 className="text-xl font-semibold leading-8 text-gray-950">{content.title}</h1>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 font-semibold text-blue-700">
          O
        </span>
        <span>OmniPost 编辑</span>
      </div>
      <p className="mt-4 rounded-md bg-blue-50 p-3 text-sm leading-6 text-blue-900">
        {content.openingConclusion}
      </p>
      <div className="mt-4 text-gray-800">
        <MarkdownBody text={content.body} variant="zhihu" />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {(content.tags ?? []).map((tag) => (
          <Badge key={tag} className="border-blue-200 bg-blue-50 text-blue-700">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-blue-700">
          <ThumbsUp className="h-4 w-4" />
          赞同
        </span>
        <span>评论</span>
        <span>收藏</span>
      </div>
    </article>
  );
}
