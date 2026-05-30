import Link from "next/link";
import { BookOpen } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

const footerLinks = [
  {
    group: "产品",
    links: [
      { label: "工作台", href: "/workspace" },
      { label: "发布记录", href: "/records" },
      { label: "平台账号", href: "/accounts" },
    ],
  },
  {
    group: "文档",
    links: [
      { label: "快速开始", href: "/docs" },
      { label: "平台指南", href: "/docs/platforms/wechat" },
      { label: "LLM 配置", href: "/docs/llm-setup" },
      { label: "API 参考", href: "/docs/api/contents" },
    ],
  },
  {
    group: "设置",
    links: [
      { label: "LLM 配置", href: "/settings" },
      { label: "平台凭证", href: "/settings" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-canvas-warm px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-sm font-bold text-white shadow-[0_4px_12px_rgba(255,92,60,0.25)]">
                OP
              </span>
              <span className="text-lg font-bold text-ink">OmniPost</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              多平台内容适配工作台
              <br />
              一次创作，多平台发布
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="/docs"
                className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-ink-muted transition hover:border-gray-300 hover:text-ink hover:bg-white"
              >
                <BookOpen className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-ink-muted transition hover:border-gray-300 hover:text-ink hover:bg-white"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.group}>
              <h4 className="text-xs font-bold tracking-[0.15em] text-ink-faint uppercase">
                {group.group}
              </h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-ink-muted transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-xs text-ink-faint">
            &copy; {new Date().getFullYear()} OmniPost. Open-source project.
          </p>
          <p className="text-xs text-ink-faint/60">Built with craftsmanship</p>
        </div>
      </div>
    </footer>
  );
}
