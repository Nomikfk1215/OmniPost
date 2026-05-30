import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import type { PlatformContent } from "@/types";
import { MarkdownBody } from "./MarkdownBody";

function getPlannedImages(content: PlatformContent) {
  const assets = content.imageAssets ?? [];
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const planned = (content.imagePlan ?? [])
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((plan) => {
      const asset = assetMap.get(plan.imageAssetId);
      return asset ? { plan, asset } : null;
    })
    .filter(Boolean) as Array<{
    plan: NonNullable<PlatformContent["imagePlan"]>[number];
    asset: NonNullable<PlatformContent["imageAssets"]>[number];
  }>;

  if (planned.length) {
    return planned;
  }

  return assets.slice(0, 9).map((asset, index) => ({
    plan: {
      role: index === 0 ? "cover" : "gallery",
      imageAssetId: asset.id,
      order: index,
      caption: asset.alt ?? asset.name
    },
    asset
  }));
}

export function XiaohongshuPreview({ content }: { content: PlatformContent }) {
  const plannedImages = getPlannedImages(content);
  const coverImage = plannedImages[0];
  const galleryImages = plannedImages.slice(1, 9);

  return (
    <article className="mx-auto max-w-[360px] overflow-hidden rounded-[8px] border border-gray-200 bg-white shadow-panel">
      {coverImage ? (
        <div className="relative aspect-[3/4] bg-gray-100">
          <Image
            src={coverImage.asset.url}
            alt={coverImage.asset.alt ?? coverImage.asset.name}
            width={coverImage.asset.width ?? 900}
            height={coverImage.asset.height ?? 1200}
            className="h-full w-full object-cover"
            unoptimized
          />
          {plannedImages.length > 1 ? (
            <div className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
              1/{plannedImages.length}
            </div>
          ) : null}
          {coverImage.plan.caption ? (
            <div className="absolute inset-x-3 bottom-3 rounded-md bg-white/90 px-3 py-2 text-sm font-medium leading-5 text-gray-950 shadow-sm">
              {coverImage.plan.caption}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid aspect-[3/4] place-items-center bg-gradient-to-br from-rose-50 via-white to-amber-50 p-6 text-center">
          <div>
            <div className="text-sm font-medium text-rose-500">封面建议</div>
            <div className="mt-2 text-2xl font-semibold leading-8 text-gray-950">
              {content.imageSuggestions?.[0] ?? content.title}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <h1 className="text-base font-semibold leading-6 text-gray-950">{content.title}</h1>
        {galleryImages.length ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {galleryImages.map(({ asset, plan }) => (
              <div key={asset.id} className="overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                <Image
                  src={asset.url}
                  alt={asset.alt ?? plan.caption ?? asset.name}
                  width={asset.width ?? 900}
                  height={asset.height ?? 1200}
                  className="aspect-[3/4] w-full object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-3">
          <MarkdownBody text={content.body} />
        </div>
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
