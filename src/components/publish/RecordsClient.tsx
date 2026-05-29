"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_INFOS } from "@/lib/platforms";
import { formatDateTime } from "@/lib/utils";
import type { PublishTask } from "@/types";

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
          <p className="text-sm text-gray-400">历史模拟发布任务</p>
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
            {tasks.map((task) => (
              <tr key={task.id} className="bg-white">
                <td className="px-4 py-3 font-medium text-gray-950">{task.title}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {task.results.map((result) => (
                      <Badge key={result.id} className={PLATFORM_INFOS[result.platform].accentClass}>
                        {PLATFORM_INFOS[result.platform].shortLabel}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {task.status === "success" ? "成功" : task.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(task.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {task.results.map((result) => (
                      <Link
                        key={result.id}
                        href={result.url}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {PLATFORM_INFOS[result.platform].shortLabel}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
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
