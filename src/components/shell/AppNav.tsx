"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  FileText,
  History,
  PenLine,
  UserRound
} from "lucide-react";
import { cn } from "@/lib/utils";

type AppNavProps = {
  title?: string;
  eyebrow?: string;
  status?: string;
  actions?: ReactNode;
};

type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  active?: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "内容中心",
    href: "/workspace",
    icon: FileText,
    active: (pathname) => pathname === "/workspace"
  },
  { label: "新建内容", href: "/workspace?intent=new", icon: PenLine },
  { label: "平台账号", icon: UserRound },
  {
    label: "发布记录",
    href: "/records",
    icon: History,
    active: (pathname) => pathname === "/records"
  }
];

export function AppNav({
  title = "内容编辑",
  eyebrow = "OmniPost Workspace",
  status = "已保存",
  actions
}: AppNavProps) {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 flex w-[216px] flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-3 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-indigo-600 text-sm font-semibold text-white">
            OP
          </span>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-gray-950">OmniPost</div>
            <div className="truncate text-xs text-gray-400">多平台创作台</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.active?.(pathname) ?? false;
            const className = cn(
              "flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition",
              active
                ? "bg-indigo-50 text-indigo-700 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-950",
              !item.href && "cursor-default opacity-80"
            );

            const content = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </>
            );

            return item.href ? (
              <Link key={item.label} href={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <button key={item.label} type="button" className={className}>
                {content}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-4 text-xs leading-5 text-gray-400">
          模拟发布工作流
        </div>
      </aside>

      <header className="fixed left-[216px] right-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/95 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/workspace"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden min-[1180px]:inline">返回</span>
          </Link>
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-gray-400">{eyebrow}</div>
            <h1 className="truncate text-base font-semibold text-gray-950">{title}</h1>
          </div>
          <span className="hidden h-7 shrink-0 items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-700 min-[1180px]:inline-flex">
            {status}
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>

        <button
          type="button"
          title="通知"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-600 transition hover:bg-gray-100 hover:text-gray-950"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-10 shrink-0 items-center gap-2 rounded-md px-2 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-900 text-xs font-semibold text-white">
            N
          </span>
          <span className="hidden font-medium min-[1180px]:inline">Nomi</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </header>
    </>
  );
}
