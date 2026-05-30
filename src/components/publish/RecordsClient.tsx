"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { cn, formatDateTime } from "@/lib/utils";
import type { PublishTask } from "@/types";

function statusMeta(status: PublishTask["status"]) {
  if (status === "success") {
    return {
      label: "成功",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700"
    };
  }

  if (status === "partial") {
    return {
      label: "部分失败",
      className: "border-amber-200 bg-amber-50 text-amber-700"
    };
  }

  return {
    label: status === "failed" ? "失败" : status,
    className: "border-rose-200 bg-rose-50 text-rose-700"
  };
}

export function RecordsClient() {
  const [tasks, setTasks] = useState<PublishTask[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);
    const response = await fetch("/api/publish/tasks", { cache: "no-store" });
    const payload = (await response.json()) as { tasks: PublishTask[] };
    setTasks(payload.tasks);
    setLoading(false);
  }

  useEffect(() => {
    void loadTasks();
  }, []);

  return (
    <div className="panel rounded-md">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h1 className="text-base font-semibold text-gray-950">发布记录</h1>
          <p className="text-sm text-gray-400">历史发布任务</p>
        </div>
        <Button variant="secondary" onClick={loadTasks} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          刷新
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">标题</th>
              <th className="px-4 py-3 font-medium">平台</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">发布时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const meta = statusMeta(task.status);
              const firstMessage = task.results.find((result) => result.message)?.message;

              return (
              <tr key={task.id} className="bg-white">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-950">{task.title}</div>
                  {firstMessage ? (
                    <div className="mt-1 max-w-[360px] break-all text-xs leading-5 text-rose-600">
                      {firstMessage}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {task.results.map((result) => (
                      <Badge
                        key={result.id}
                        className={cn(
                          result.status === "success"
                            ? PLATFORM_INFOS[result.platform].accentClass
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        )}
                      >
                        {PLATFORM_INFOS[result.platform].shortLabel}
                        {result.status === "failed" ? "失败" : ""}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={meta.className}>{meta.label}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(task.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {task.results.map((result) => {
                      const label = PLATFORM_INFOS[result.platform].shortLabel;

                      return result.url ? (
                        <Link
                          key={result.id}
                          href={result.url}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          {label}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span
                          key={result.id}
                          title={result.message ?? "发布失败"}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700"
                        >
                          {label}失败
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
              );
            })}
            {!tasks.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">
                  暂无发布记录
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
