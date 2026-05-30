import { cleanGeneratedImageText, createGeneratedCardImages } from "@/lib/images/generated";
import { normalizeImageAssets } from "@/lib/images/assets";
import type { Content, ImageAsset, PlatformContent, PlatformImagePlan } from "@/types";

const generatedCoverConfig = {
  wechat: { count: 1, aspect: "2:1" },
  xiaohongshu: { count: 3, aspect: "3:4" },
  bilibili: { count: 1, aspect: "16:9" }
} as const;

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
    caption: asset.alt || cleanGeneratedImageText(params.imageSuggestions?.[index]) || asset.name
  }));
}

function buildCoverPlan(asset: ImageAsset): PlatformImagePlan {
  return {
    role: "cover",
    imageAssetId: asset.id,
    order: 0,
    caption: asset.alt ?? asset.name
  };
}

export async function enrichPlatformImages(
  content: Content,
  platformContent: PlatformContent
): Promise<PlatformContent> {
  const sourceAssets = normalizeImageAssets(content.images);
  let imageAssets = sourceAssets;
  const coverConfig = generatedCoverConfig[platformContent.platform as keyof typeof generatedCoverConfig];

  if (coverConfig && imageAssets.length === 0) {
    imageAssets = await createGeneratedCardImages({
      title: platformContent.title,
      body: platformContent.body || platformContent.html || platformContent.description || platformContent.digest || "",
      imageSuggestions: platformContent.imageSuggestions,
      count: coverConfig.count,
      aspect: coverConfig.aspect
    });
  }

  if (imageAssets.length === 0) {
    return platformContent;
  }

  if (platformContent.platform !== "xiaohongshu") {
    return {
      ...platformContent,
      imageAssets,
      imagePlan: imageAssets[0] ? [buildCoverPlan(imageAssets[0])] : undefined
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
