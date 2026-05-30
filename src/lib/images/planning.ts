import { createGeneratedCardImages } from "@/lib/images/generated";
import { normalizeImageAssets } from "@/lib/images/assets";
import type { Content, ImageAsset, PlatformContent, PlatformImagePlan } from "@/types";

function buildXiaohongshuPlan(params: {
  title: string;
  assets: ImageAsset[];
  imageSuggestions?: string[];
}) {
  return params.assets.slice(0, 9).map<PlatformImagePlan>((asset, index) => ({
    role: index === 0 ? "cover" : "gallery",
    imageAssetId: asset.id,
    order: index,
    title: index === 0 ? params.title : undefined,
    caption: params.imageSuggestions?.[index] ?? asset.alt ?? asset.name
  }));
}

export async function enrichPlatformImages(
  content: Content,
  platformContent: PlatformContent
): Promise<PlatformContent> {
  const sourceAssets = normalizeImageAssets(content.images);
  let imageAssets = sourceAssets;

  if (platformContent.platform === "xiaohongshu" && imageAssets.length === 0) {
    imageAssets = await createGeneratedCardImages({
      title: platformContent.title,
      body: platformContent.body,
      imageSuggestions: platformContent.imageSuggestions,
      count: 3
    });
  }

  if (imageAssets.length === 0) {
    return platformContent;
  }

  if (platformContent.platform !== "xiaohongshu") {
    return {
      ...platformContent,
      imageAssets
    };
  }

  return {
    ...platformContent,
    imageAssets,
    imagePlan: buildXiaohongshuPlan({
      title: platformContent.title,
      assets: imageAssets,
      imageSuggestions: platformContent.imageSuggestions
    })
  };
}
