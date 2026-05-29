import Link from "next/link";
import { FileText, History } from "lucide-react";

export function AppNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        <Link href="/workspace" className="flex items-center gap-2 font-semibold text-gray-950">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gray-950 text-sm text-white">
            OP
          </span>
          <span>OmniPost</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/workspace"
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-gray-700 hover:bg-gray-100"
          >
            <FileText className="h-4 w-4" />
            工作台
          </Link>
          <Link
            href="/records"
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-gray-700 hover:bg-gray-100"
          >
            <History className="h-4 w-4" />
            发布记录
          </Link>
        </nav>
      </div>
    </header>
  );
}
