import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OmniPost — 多平台内容适配工作台",
  description:
    "一次创作，多平台发布。OmniPost 帮助内容创作者将 Markdown 文章一键适配到微信公众号、知乎、小红书、Bilibili 等平台，智能优化排版与风格。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
