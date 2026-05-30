import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

export const metadata = {
  title: "文档 — OmniPost",
  description: "OmniPost 多平台内容适配工作台使用文档",
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <DocsSidebar />
      <main className="lg:ml-[260px]">{children}</main>
    </div>
  );
}
