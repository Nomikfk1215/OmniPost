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

function buildCoverGalleryPlans(assets: ImageAsset[]): PlatformImagePlan[] {
  return assets.map((asset, index) => ({
    role: index === 0 ? "cover" : "gallery",
    imageAssetId: asset.id,
    order: index,
    caption: asset.alt ?? asset.name
  }));
}

function buildInlinePlans(assets: ImageAsset[], startOrder = 0): PlatformImagePlan[] {
  return assets.map((asset, index) => ({
    role: "inline",
    imageAssetId: asset.id,
    order: startOrder + index,
    caption: asset.alt ?? asset.name
  }));
}

export async function enrichPlatformImages(
  content: Content,
  platformContent: PlatformContent
): Promise<PlatformContent> {
  const sourceAssets = normalizeImageAssets(content.images);
  const inlineAssets = sourceAssets.filter((asset) => asset.source === "markdown");
  let coverAssets = sourceAssets.filter((asset) => asset.source !== "markdown");
  let imageAssets = [...coverAssets, ...inlineAssets];
  const coverConfig = generatedCoverConfig[platformContent.platform as keyof typeof generatedCoverConfig];

  if (coverConfig && coverAssets.length === 0 && (imageAssets.length === 0 || platformContent.platform !== "xiaohongshu")) {
    coverAssets = await createGeneratedCardImages({
      title: platformContent.title,
      body: platformContent.body || platformContent.html || platformContent.description || platformContent.digest || "",
      imageSuggestions: platformContent.imageSuggestions,
      count: coverConfig.count,
      aspect: coverConfig.aspect
    });
    imageAssets = [...coverAssets, ...inlineAssets];
  }

  if (imageAssets.length === 0) {
    return platformContent;
  }

  if (platformContent.platform !== "xiaohongshu") {
    const coverPlans = buildCoverGalleryPlans(coverAssets);

    return {
      ...platformContent,
      imageAssets,
      imagePlan: [...coverPlans, ...buildInlinePlans(inlineAssets, coverPlans.length)]
    };
  }

  const xiaohongshuAssets = coverAssets.length ? [...coverAssets, ...inlineAssets] : inlineAssets;

  return {
    ...platformContent,
    imageAssets,
    imagePlan: buildXiaohongshuPlan({
      title: platformContent.title,
      assets: xiaohongshuAssets,
      imageSuggestions: platformContent.imageSuggestions
    }).map((plan) => {
      const asset = imageAssets.find((candidate) => candidate.id === plan.imageAssetId);
      return asset?.source === "markdown" ? { ...plan, role: "inline" } : plan;
    })
  };
}
