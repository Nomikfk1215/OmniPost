"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Droplet,
  Heading1,
  Heading2,
  Highlighter,
  Image,
  List,
  Minus,
  Pilcrow,
  QrCode,
  Quote,
  Type
} from "lucide-react";
import { STYLE_PRESETS } from "@/lib/presets";
import { cn } from "@/lib/utils";
import type { StylePreset, WorkspaceFormatting } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

const styleOptions: Array<{ id: StylePreset; label: string }> = [
  { id: "fresh", label: "清新简约" },
  { id: "professional", label: "专业干货" },
  { id: "casual", label: "轻松种草" }
];

const titleOptions: Array<{ id: WorkspaceFormatting["titleStyle"]; label: string; icon: LucideIcon }> = [
  { id: "title", label: "标题", icon: Heading1 },
  { id: "subtitle", label: "副标题", icon: Heading2 },
  { id: "heading", label: "小标题", icon: Type }
];

const bodyOptions: Array<{ id: WorkspaceFormatting["bodyStyle"]; label: string; icon: LucideIcon }> = [
  { id: "body", label: "正文", icon: Pilcrow },
  { id: "quote", label: "引用", icon: Quote },
  { id: "list", label: "列表", icon: List }
];

const componentOptions: Array<{ id: WorkspaceFormatting["component"]; label: string; icon: LucideIcon }> = [
  { id: "image", label: "图片", icon: Image },
  { id: "divider", label: "分割线", icon: Minus },
  { id: "qrcode", label: "二维码", icon: QrCode }
];

const emphasisOptions: Array<{ id: WorkspaceFormatting["emphasis"]; label: string; icon: LucideIcon }> = [
  { id: "bold", label: "加粗", icon: Bold },
  { id: "color", label: "颜色", icon: Droplet },
  { id: "background", label: "背景", icon: Highlighter }
];

function MiniOption({
  active,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean;
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-md border px-2 text-xs font-medium transition",
        active
          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-950"
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </button>
  );
}

function OptionGroup<TValue extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: Array<{ id: TValue; label: string; icon: LucideIcon }>;
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((option) => (
          <MiniOption
            key={option.id}
            active={value === option.id}
            icon={option.icon}
            label={option.label}
            onClick={() => onChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function StylePresetSelector() {
  const { state, setStylePreset } = useWorkflow();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-gray-800">排版风格</div>
        <span className="shrink-0 rounded-full border border-indigo-100 bg-white px-2 py-0.5 text-xs font-medium text-indigo-700">
          {STYLE_PRESETS[state.settings.stylePreset].label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {styleOptions.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => setStylePreset(style.id)}
            className={cn(
              "h-8 rounded-md border px-2 text-xs font-medium transition",
              state.settings.stylePreset === style.id
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-950"
            )}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FormattingOptionGroups() {
  const { state, setFormatting } = useWorkflow();
  const formatting = state.settings.formatting;

  return (
    <div className="space-y-3">
      <OptionGroup
        label="标题"
        options={titleOptions}
        value={formatting.titleStyle}
        onChange={(titleStyle) => setFormatting({ titleStyle })}
      />
      <OptionGroup
        label="正文"
        options={bodyOptions}
        value={formatting.bodyStyle}
        onChange={(bodyStyle) => setFormatting({ bodyStyle })}
      />
      <OptionGroup
        label="组件"
        options={componentOptions}
        value={formatting.component}
        onChange={(component) => setFormatting({ component })}
      />
      <OptionGroup
        label="强调"
        options={emphasisOptions}
        value={formatting.emphasis}
        onChange={(emphasis) => setFormatting({ emphasis })}
      />
    </div>
  );
}

export function FormattingControls() {
  return (
    <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-gray-950">排版偏好</div>
          <div className="text-xs text-gray-400">用于后续平台适配的样式倾向</div>
        </div>
      </div>
      <StylePresetSelector />
      <FormattingOptionGroups />
    </div>
  );
}
