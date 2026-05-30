"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { docsNav } from "@/lib/docs/content";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();
  const currentSlug = pathname.replace("/docs", "").replace(/^\//, "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(docsNav.map((s) => [s.title, true]))
  );

  const toggleSection = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const sidebarContent = (
    <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
      {/* Mobile header */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-ink"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-coral text-xs font-bold text-white">
            OP
          </span>
          OmniPost
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-canvas-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Back to home */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-coral"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 12H5m0 0l7 7m-7-7l7-7"
          />
        </svg>
        返回首页
      </Link>

      {/* Nav sections */}
      {docsNav.map((section) => (
        <div key={section.title} className="mb-6">
          <button
            onClick={() => toggleSection(section.title)}
            className="flex w-full items-center gap-2 py-1 text-left"
          >
            <span className="text-xs font-bold tracking-[0.12em] text-ink-faint uppercase">
              {section.title}
            </span>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-ink-faint transition-transform",
                !expanded[section.title] && "-rotate-90"
              )}
            />
          </button>

          {expanded[section.title] && (
            <ul className="mt-2 space-y-0.5 border-l-2 border-gray-100 pl-3">
              {section.items.map((item) => {
                const isActive = currentSlug === item.slug;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/docs${item.slug ? `/${item.slug}` : ""}`}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-coral-pale text-coral-dark"
                          : "text-ink-muted hover:text-ink hover:bg-canvas-muted"
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5 text-ink" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop fixed, mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-gray-100 bg-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo header */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
          <Link
            href="/docs"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[-0.01em] text-ink"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-coral text-xs font-bold text-white shadow-[0_3px_8px_rgba(255,92,60,0.2)]">
              OP
            </span>
            文档
          </Link>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
}
