"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Code2,
  FileImage,
  Heading1,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Plus,
  Quote,
  Redo2,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, splitTags } from "@/lib/utils";
import type { ContentType } from "@/types";
import { FormattingOptionGroups, StylePresetSelector } from "./FormattingControls";
import { useWorkflow } from "./WorkflowProvider";

const contentTypes: Array<{ value: ContentType; label: string }> = [
  { value: "tutorial", label: "教程干货" },
  { value: "article", label: "深度文章" },
  { value: "note", label: "灵感笔记" },
  { value: "campaign", label: "活动文案" }
];

const toolbarItems = [
  { id: "bold", label: "加粗", icon: Bold, snippet: "**重点内容**" },
  { id: "italic", label: "斜体", icon: Italic, snippet: "*补充说明*" },
  { id: "heading", label: "标题", icon: Heading1, snippet: "## 小标题" },
  { id: "list", label: "列表", icon: List, snippet: "- 要点一\n- 要点二" },
  { id: "link", label: "链接", icon: Link2, snippet: "[链接文字](https://example.com)" },
  { id: "image", label: "图片", icon: ImageIcon, snippet: "![图片说明](图片地址)" },
  { id: "quote", label: "引用", icon: Quote, snippet: "> 引用内容" },
  { id: "code", label: "代码", icon: Code2, snippet: "`代码片段`" }
];

export function LeftPanel() {
  const { state, updateRaw, addImages, removeImage, loadSample } = useWorkflow();
  const [tagDraft, setTagDraft] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Cursor tracking & undo/redo
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const MAX_HISTORY = 50;
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  function pushUndo(body: string) {
    undoStackRef.current.push(body);
    if (undoStackRef.current.length > MAX_HISTORY) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  const coverImage = state.rawContent.images[0];
  const wordCount = useMemo(
    () => state.rawContent.body.replace(/\s/g, "").length,
    [state.rawContent.body]
  );

  function insertSnippet(snippet: string) {
    const textarea = textAreaRef.current;
    const body = state.rawContent.body;

    // Determine cursor position. Prefer live textarea state, fall back to tracked position.
    const { start, end } = textarea
      ? { start: textarea.selectionStart, end: textarea.selectionEnd }
      : cursorRef.current;

    // If no cursor position available, fall back to appending at end
    const noValidCursor = start === 0 && end === 0 && body.length > 0 && !textarea;
    if (noValidCursor) {
      const prefix = body.trim() ? "\n\n" : "";
      const newBody = `${body}${prefix}${snippet}`;
      pushUndo(body);
      updateRaw({ body: newBody });
      return;
    }

    const newBody = body.slice(0, start) + snippet + body.slice(end);
    const newCursorPos = start + snippet.length;

    pushUndo(body);
    updateRaw({ body: newBody });

    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      const el = textAreaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  }

  function handleUndo() {
    if (undoStackRef.current.length === 0) return;
    const prev = undoStackRef.current.pop()!;
    redoStackRef.current.push(state.rawContent.body);
    updateRaw({ body: prev });
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
  }

  function handleRedo() {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(state.rawContent.body);
    updateRaw({ body: next });
    setCanRedo(redoStackRef.current.length > 0);
    setCanUndo(true);
  }

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
          <p className="truncate text-xs text-gray-400">标题、类型、标签、封面图和正文 Markdown</p>
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
            <span>正文（Markdown）</span>
            <span className="text-xs font-normal text-gray-400">{wordCount} 字</span>
          </div>
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
            <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1">
              {toolbarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => insertSnippet(item.snippet)}
                    className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
              <span className="mx-1 h-5 w-px bg-gray-200" />
              <button
                type="button"
                title="撤销"
                disabled={!canUndo}
                onClick={handleUndo}
                className={`grid h-8 w-8 place-items-center rounded transition ${
                  canUndo ? "text-gray-600 hover:bg-white hover:text-gray-950" : "text-gray-300"
                }`}
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="重做"
                disabled={!canRedo}
                onClick={handleRedo}
                className={`grid h-8 w-8 place-items-center rounded transition ${
                  canRedo ? "text-gray-600 hover:bg-white hover:text-gray-950" : "text-gray-300"
                }`}
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              ref={textAreaRef}
              value={state.rawContent.body}
              onChange={(event) => updateRaw({ body: event.target.value })}
              onBlur={(event) => {
                const target = event.target as HTMLTextAreaElement;
                cursorRef.current = { start: target.selectionStart, end: target.selectionEnd };
                // Push snapshot to undo stack on blur
                const body = state.rawContent.body;
                const lastUndo = undoStackRef.current[undoStackRef.current.length - 1];
                if (lastUndo !== body) {
                  pushUndo(body);
                }
              }}
              onSelect={(event) => {
                const target = event.target as HTMLTextAreaElement;
                cursorRef.current = { start: target.selectionStart, end: target.selectionEnd };
              }}
              placeholder="粘贴文章、笔记、脚本或活动文案..."
              className="min-h-[230px] resize-none border-0 focus:border-0 focus:ring-0"
            />
            <div className="flex h-9 items-center justify-between border-t border-gray-100 px-3 text-xs text-gray-400">
              <span>Markdown 语法已开启</span>
              <span>{state.rawContent.body.split(/\n/).length} 行</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
