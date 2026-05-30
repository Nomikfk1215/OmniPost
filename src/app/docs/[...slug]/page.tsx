import { notFound } from "next/navigation";
import { getDocContent, getAllDocSlugs } from "@/lib/docs/content";
import type { Metadata } from "next";

type Props = {
  params: { slug: string[] };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.join("/");
  const doc = getDocContent(slug);
  if (!doc) return { title: "未找到 — OmniPost 文档" };
  return {
    title: `${doc.title} — OmniPost 文档`,
    description: doc.description,
  };
}

export default function DocsSlugPage({ params }: Props) {
  const slug = params.slug.join("/");
  const doc = getDocContent(slug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:py-16">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-ink sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{doc.description}</p>
        <hr className="mt-8 border-gray-100" />
      </header>

      {/* Content */}
      <div
        className="docs-prose"
        dangerouslySetInnerHTML={{ __html: doc.body }}
      />
    </article>
  );
}

/**
 * Pre-render all documentation pages at build time.
 * Required for `output: "export"` (static site generation).
 */
export function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs
    .filter((slug) => slug !== "") // index page handled by /docs/page.tsx
    .map((slug) => ({ slug: slug.split("/") }));
}
