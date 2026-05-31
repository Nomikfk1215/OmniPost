"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  FileImage,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { extractImagePositions } from "@/lib/images/assets";
import { cn, splitTags } from "@/lib/utils";
import type { ContentType } from "@/types";
import { FormattingOptionGroups, StylePresetSelector } from "./FormattingControls";
import { RichTextEditor } from "./RichTextEditor";
import { useWorkflow } from "./WorkflowProvider";

const contentTypes: Array<{ value: ContentType; label: string }> = [
  { value: "tutorial", label: "教程干货" },
  { value: "article", label: "深度文章" },
  { value: "note", label: "灵感笔记" },
  { value: "campaign", label: "活动文案" }
];

function getTextFromBody(body: string) {
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function LeftPanel() {
  const { state, updateRaw, addImages, removeImage, loadSample } = useWorkflow();
  const [tagDraft, setTagDraft] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inlineImageUrls = useMemo(
    () => new Set(extractImagePositions(state.rawContent.body).map((image) => image.url)),
    [state.rawContent.body]
  );
  const coverImage = useMemo(
    () =>
      state.rawContent.images.find(
        (image) =>
          !inlineImageUrls.has(image.url) &&
          !(image.localPreviewUrl && inlineImageUrls.has(image.localPreviewUrl))
      ),
    [inlineImageUrls, state.rawContent.images]
  );
  const wordCount = useMemo(
    () => getTextFromBody(state.rawContent.body).replace(/\s/g, "").length,
    [state.rawContent.body]
  );

  function addTagsFromDraft() {
    const nextTags = splitTags(tagDraft).filter(
      (tag) => !state.rawContent.userTags.includes(tag)
    );

    if (!nextTags.length) {
      return;
    }

    updateRaw({ userTags: [...state.rawContent.userTags, ...nextTags] });
    setTagDraft("");
  }

  function removeTag(tag: string) {
    updateRaw({
      userTags: state.rawContent.userTags.filter((item) => item !== tag)
    });
  }

  return (
    <section className="panel flex min-h-0 flex-col overflow-hidden rounded-md">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-950">内容编辑区</h2>
          <p className="truncate text-xs text-gray-400">标题、类型、标签、封面图和正文排版</p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadSample}>
          <Sparkles className="h-4 w-4" />
          示例
        </Button>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-auto p-4">
        <Field label="标题" hint="可选">
          <Input
            value={state.rawContent.title}
            onChange={(event) => updateRaw({ title: event.target.value })}
            placeholder="如何用 AI 提升学习效率"
          />
        </Field>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-gray-800">
            <span>标签</span>
            <span className="text-xs font-normal text-gray-400">回车新增</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTagsFromDraft();
                }
              }}
              placeholder="AI，学习效率，方法论"
            />
            <Button size="icon" variant="secondary" onClick={addTagsFromDraft} title="添加标签">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex min-h-8 flex-wrap gap-2">
            {state.rawContent.userTags.length ? (
              state.rawContent.userTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 text-xs font-medium text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100"
                >
                  {tag}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-400">暂无标签</span>
            )}
          </div>
        </div>

        <StylePresetSelector />

        <div className="rounded-md border border-gray-200">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-gray-400" />
              高级设置
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>
          {showAdvanced ? (
            <div className="space-y-3 border-t border-gray-100 px-3 py-3">
              <Field label="内容类型">
                <select
                  value={state.rawContent.contentType}
                  onChange={(event) => updateRaw({ contentType: event.target.value as ContentType })}
                  className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  {contentTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <FormattingOptionGroups />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-gray-800">
            <span>封面图</span>
            <span className="text-xs font-normal text-gray-400">可选</span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
            <div
              className={cn(
                "relative overflow-hidden rounded-md border",
                coverImage ? "border-gray-200 bg-white" : "border-dashed border-gray-300 bg-gray-50"
              )}
            >
              {coverImage ? (
                <>
                  <Image
                    src={coverImage.url}
                    alt={coverImage.name}
                    width={360}
                    height={180}
                    className="h-28 w-full object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    title="删除封面图"
                    onClick={() => removeImage(coverImage.id)}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-white/90 text-gray-600 shadow-sm transition hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="grid h-28 place-items-center text-center text-sm text-gray-500">
                  <span>
                    <FileImage className="mx-auto mb-2 h-5 w-5" />
                    暂无封面
                  </span>
                </div>
              )}
            </div>
            <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-white text-center text-sm text-gray-600 transition hover:bg-gray-50">
              <Upload className="h-5 w-5" />
              <span className="mt-2">上传图片</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => addImages(event.target.files)}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-gray-800">
            <span>正文</span>
            <span className="text-xs font-normal text-gray-400">{wordCount} 字</span>
          </div>
          <RichTextEditor
            value={state.rawContent.body}
            onChange={(body) => updateRaw({ body })}
            onImageFiles={addImages}
          />
        </div>
      </div>
    </section>
  );
}
