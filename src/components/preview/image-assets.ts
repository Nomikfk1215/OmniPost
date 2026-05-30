import type { PlatformContent } from "@/types";

export function getOrderedPreviewImages(content: PlatformContent) {
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

  return assets.map((asset, index) => ({
    plan: {
      role: index === 0 ? "cover" : "gallery",
      imageAssetId: asset.id,
      order: index,
      caption: asset.alt ?? asset.name
    },
    asset
  }));
}

export function getCoverPreviewImage(content: PlatformContent) {
  const ordered = getOrderedPreviewImages(content);
  return ordered.find(({ plan }) => plan.role === "cover") ?? ordered[0] ?? null;
}
