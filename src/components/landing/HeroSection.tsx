"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas-warm px-6 pt-16">
      {/* Background decoration — subtle gradient blobs */}
      <div
        className="absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-coral/5 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-bilibili/6 blur-[100px]"
        aria-hidden="true"
      />

      {/* Decorative top-left accent line */}
      <div
        className={`absolute left-12 top-32 hidden lg:block transition-all duration-1000 ease-out ${
          visible ? "opacity-100" : "opacity-0 -translate-y-4"
        }`}
        aria-hidden="true"
      >
        <div className="h-1 w-16 rounded-full bg-coral/50" />
        <div className="mt-3 h-1 w-10 rounded-full bg-coral/30" />
        <div className="mt-3 h-1 w-6 rounded-full bg-coral/15" />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 delay-100 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <span className="inline-flex items-center gap-3 rounded-full border border-coral/15 bg-white/80 px-4 py-1.5 text-sm font-semibold text-ink-soft backdrop-blur shadow-sm">
            <span className="h-2 w-2 rounded-full bg-coral animate-pulse-soft" />
            多平台内容适配工作台
          </span>
        </div>

        {/* Headline — bold, dark, highly visible */}
        <h1
          className={`font-display text-5xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ink transition-all duration-700 delay-200 ease-out sm:text-6xl md:text-7xl lg:text-8xl ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          一次创作
          <br />
          <span className="gradient-text">多平台</span>
          发布
        </h1>

        {/* Subtitle — dark, readable */}
        <p
          className={`mx-auto mt-8 max-w-xl text-lg leading-relaxed text-ink-soft transition-all duration-700 delay-300 ease-out sm:text-xl ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          用 Markdown 写一次，一键生成适配微信公众号、知乎、小红书、Bilibili
          的内容版本，智能调整排版、语气与标签。
        </p>

        {/* CTA buttons */}
        <div
          className={`mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center transition-all duration-700 delay-400 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link
            href="/workspace"
            className="shimmer-btn inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(255,92,60,0.25)] transition-all hover:shadow-[0_12px_32px_rgba(255,92,60,0.35)] hover:-translate-y-0.5 active:scale-[0.97]"
          >
            开始创作
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 px-8 py-4 text-base font-semibold text-ink-soft transition-all hover:border-gray-300 hover:bg-white hover:shadow-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-700 delay-700 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronDown className="h-5 w-5 animate-bounce text-ink-faint" />
      </div>
    </section>
  );
}
