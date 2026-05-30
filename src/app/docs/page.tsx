import { getDocContent } from "@/lib/docs/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "介绍 — OmniPost 文档",
  description: "了解 OmniPost 的核心能力与设计理念",
};

export default function DocsIndexPage() {
  const doc = getDocContent("");

  if (!doc) {
    return (
      <div className="px-8 py-20 text-center">
        <p className="text-ink-muted">文档未找到</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-8 lg:py-16">
      {/* Header */}
      <header className="mb-10">
        <h1 className="font-display text-3xl font-normal tracking-[-0.02em] text-ink sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{doc.description}</p>
        <hr className="mt-8 border-gold-pale/40" />
      </header>

      {/* Content */}
      <div
        className="docs-prose"
        dangerouslySetInnerHTML={{ __html: doc.body }}
      />
    </article>
  );
}
