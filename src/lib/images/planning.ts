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

  // Separate markdown (inline) images from cover/gallery assets
  const markdownAssets = imageAssets.filter((a) => a.source === "markdown");
  const nonMarkdownAssets = imageAssets.filter((a) => a.source !== "markdown");

  // Build inline plans from markdown images
  const inlinePlans: PlatformImagePlan[] = markdownAssets.map((asset, index) => ({
    role: "inline",
    imageAssetId: asset.id,
    order: index,
    caption: asset.alt ?? asset.name
  }));

  if (platformContent.platform !== "xiaohongshu") {
    // Non-xiaohongshu: cover plan from first non-markdown asset + inline plans
    return {
      ...platformContent,
      imageAssets,
      imagePlan: [
        ...(nonMarkdownAssets[0] ? [buildCoverPlan(nonMarkdownAssets[0])] : []),
        ...inlinePlans
      ]
    };
  }

  // Xiaohongshu: gallery plans from non-markdown assets + inline plans
  const galleryPlans = buildXiaohongshuPlan({
    title: platformContent.title,
    assets: nonMarkdownAssets.length > 0 ? nonMarkdownAssets : markdownAssets,
    imageSuggestions: platformContent.imageSuggestions
  });

  return {
    ...platformContent,
    imageAssets,
    imagePlan: [...galleryPlans, ...inlinePlans]
  };
}
