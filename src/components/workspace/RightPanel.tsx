"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Columns3,
  Droplet,
  Heading1,
  Heading2,
  Highlighter,
  Image,
  List,
  Minus,
  Paintbrush,
  Pilcrow,
  QrCode,
  Quote,
  Type
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STYLE_PRESETS } from "@/lib/presets";
import { cn } from "@/lib/utils";
import type { StylePreset, WorkspaceFormatting } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

type SelectTileProps = {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

const styleOptions: Array<{ id: StylePreset; label: string; hint: string }> = [
  { id: "fresh", label: "清新简约", hint: "短段落、轻层级" },
  { id: "professional", label: "专业干货", hint: "结构化、信息密" },
  { id: "casual", label: "轻松种草", hint: "口语化、体验感" }
];

const titleOptions: Array<{
  id: WorkspaceFormatting["titleStyle"];
  label: string;
  icon: LucideIcon;
}> = [
  { id: "title", label: "标题", icon: Heading1 },
  { id: "subtitle", label: "副标题", icon: Heading2 },
  { id: "heading", label: "小标题", icon: Type }
];

const bodyOptions: Array<{
  id: WorkspaceFormatting["bodyStyle"];
  label: string;
  icon: LucideIcon;
}> = [
  { id: "body", label: "正文", icon: Pilcrow },
  { id: "quote", label: "引用", icon: Quote },
  { id: "list", label: "列表", icon: List }
];

const componentOptions: Array<{
  id: WorkspaceFormatting["component"];
  label: string;
  icon: LucideIcon;
}> = [
  { id: "image", label: "图片", icon: Image },
  { id: "divider", label: "分割线", icon: Minus },
  { id: "qrcode", label: "二维码", icon: QrCode }
];

const emphasisOptions: Array<{
  id: WorkspaceFormatting["emphasis"];
  label: string;
  icon: LucideIcon;
}> = [
  { id: "bold", label: "加粗", icon: Bold },
  { id: "color", label: "颜色", icon: Droplet },
  { id: "background", label: "背景", icon: Highlighter }
];

function SelectTile({ active, label, icon: Icon, onClick }: SelectTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[62px] min-w-0 flex-col items-center justify-center gap-1 rounded-md border text-xs font-medium transition",
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-950"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="max-w-full truncate px-1">{label}</span>
    </button>
  );
}

export function RightPanel() {
  const { state, setStylePreset, setFormatting } = useWorkflow();
  const formatting = state.settings.formatting;

  return (
    <section className="panel flex min-h-0 flex-col overflow-hidden rounded-md">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-950">排版样式区</h2>
          <p className="truncate text-xs text-gray-400">选择样式、组件和重点强调</p>
        </div>
        <Badge className="border-indigo-100 bg-indigo-50 text-indigo-700">
          {STYLE_PRESETS[state.settings.stylePreset].label}
        </Badge>
      </div>

      <div className="scrollbar-thin flex-1 space-y-5 overflow-auto p-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900">选择样式</div>
          <div className="space-y-2">
            {styleOptions.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setStylePreset(style.id)}
                className={cn(
                  "flex min-h-[58px] w-full items-center gap-3 rounded-md border px-3 text-left transition",
                  state.settings.stylePreset === style.id
                    ? "border-indigo-300 bg-indigo-50 text-indigo-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-indigo-600">
                  <Paintbrush className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{style.label}</span>
                  <span className="block truncate text-xs text-gray-500">{style.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900">标题样式</div>
          <div className="grid grid-cols-3 gap-2">
            {titleOptions.map((item) => (
              <SelectTile
                key={item.id}
                active={formatting.titleStyle === item.id}
                label={item.label}
                icon={item.icon}
                onClick={() => setFormatting({ titleStyle: item.id })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900">正文样式</div>
          <div className="grid grid-cols-3 gap-2">
            {bodyOptions.map((item) => (
              <SelectTile
                key={item.id}
                active={formatting.bodyStyle === item.id}
                label={item.label}
                icon={item.icon}
                onClick={() => setFormatting({ bodyStyle: item.id })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900">内容组件</div>
          <div className="grid grid-cols-3 gap-2">
            {componentOptions.map((item) => (
              <SelectTile
                key={item.id}
                active={formatting.component === item.id}
                label={item.label}
                icon={item.icon}
                onClick={() => setFormatting({ component: item.id })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-900">重点强调</div>
          <div className="grid grid-cols-3 gap-2">
            {emphasisOptions.map((item) => (
              <SelectTile
                key={item.id}
                active={formatting.emphasis === item.id}
                label={item.label}
                icon={item.icon}
                onClick={() => setFormatting({ emphasis: item.id })}
              />
            ))}
          </div>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Columns3 className="h-4 w-4" />
            当前排版组合
          </div>
          <div className="space-y-1 text-xs leading-5 text-gray-500">
            <p>标题：{titleOptions.find((item) => item.id === formatting.titleStyle)?.label}</p>
            <p>正文：{bodyOptions.find((item) => item.id === formatting.bodyStyle)?.label}</p>
            <p>组件：{componentOptions.find((item) => item.id === formatting.component)?.label}</p>
            <p>强调：{emphasisOptions.find((item) => item.id === formatting.emphasis)?.label}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
