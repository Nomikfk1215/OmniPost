import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/shell/AppNav";
import { PreviewRenderer } from "@/components/preview/PreviewRenderer";
import { ValidationPanel } from "@/components/preview/ValidationPanel";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { getPlatformContentById } from "@/lib/db/platform-contents";
import { PLATFORMS, type Platform } from "@/types";

export default async function MockDetailPage({
  params
}: {
  params: { platform: Platform; id: string };
}) {
  if (!PLATFORMS.includes(params.platform)) {
    notFound();
  }

  const content = await getPlatformContentById(params.id);

  if (!content || content.platform !== params.platform) {
    notFound();
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto grid max-w-[1200px] gap-4 px-4 py-4 lg:grid-cols-[1fr_340px]">
        <div className="panel rounded-md p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href="/records"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              返回记录
            </Link>
            <Badge className={PLATFORM_INFOS[content.platform].accentClass}>
              {PLATFORM_INFOS[content.platform].label}
            </Badge>
          </div>
          <PreviewRenderer content={content} />
        </div>
        <aside className="panel h-fit rounded-md p-4">
          <h2 className="text-sm font-semibold text-gray-950">发布校验</h2>
          <div className="mt-3">
            <ValidationPanel checks={content.validation.checks} />
          </div>
        </aside>
      </main>
    </>
  );
}
