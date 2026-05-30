import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-ink px-6 py-24 sm:py-32 lg:py-40">
      {/* Accent gradient */}
      <div
        className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/10 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-bilibili/8 blur-[100px]"
        aria-hidden="true"
      />

      <ScrollReveal className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl">
          准备好开始
          <span className="gradient-text"> 多平台创作 </span>
          了吗？
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-gray-300">
          无需注册，无需付费。打开工作台，即刻体验从撰写到发布的全流程。
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-ink transition-all hover:bg-gray-100 hover:shadow-[0_12px_32px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:scale-[0.97]"
          >
            进入工作台
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-600 px-8 py-4 text-base font-semibold text-gray-300 transition-all hover:border-gray-400 hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
