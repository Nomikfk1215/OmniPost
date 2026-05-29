import { BilibiliPreview } from "./BilibiliPreview";
import { WechatPreview } from "./WechatPreview";
import { XiaohongshuPreview } from "./XiaohongshuPreview";
import { ZhihuPreview } from "./ZhihuPreview";
import type { Platform, PlatformContent } from "@/types";

const previewMap: Record<Platform, (props: { content: PlatformContent }) => JSX.Element> = {
  wechat: WechatPreview,
  zhihu: ZhihuPreview,
  xiaohongshu: XiaohongshuPreview,
  bilibili: BilibiliPreview
};

export function PreviewRenderer({
  content
}: {
  content: PlatformContent;
}) {
  const Component = previewMap[content.platform];
  return <Component content={content} />;
}
