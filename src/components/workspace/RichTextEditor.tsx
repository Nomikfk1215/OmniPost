"use client";

import {
  Bold,
  FileUp,
  Heading1,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Quote,
  Redo2,
  Undo2
} from "lucide-react";
import { useEffect, useRef, useState, type ClipboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/types";

type AddImagesOptions = {
  onLocalImages?: (images: UploadedImage[]) => void;
};

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onImageFiles: (files: FileList | null, options?: AddImagesOptions) => void;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hasHtmlTag(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeEditorHtml(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (hasHtmlTag(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function cleanEmptyHtml(value: string) {
  const withoutBreaks = value.replace(/<br\s*\/?>/gi, "").replace(/&nbsp;/g, " ").trim();

  return withoutBreaks ? value : "";
}

function sanitizePastedHtml(value: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, "text/html");

  doc.querySelectorAll("script, style, iframe, object, embed, meta, link").forEach((node) => {
    node.remove();
  });
  doc.body.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      if (/^on/i.test(attribute.name) || attribute.name === "style") {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<span>$1</span>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const image = line.match(/^!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);

    if (image) {
      const alt = image[1]?.trim() || "图片";
      const src = image[2]?.trim() ?? "";
      const caption = image[3]?.trim() || alt;
      blocks.push(
        `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>`
      );
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      const level = Math.min(3, Math.max(2, heading[1].length + 1));
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^>\s+/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s+/, ""));
        index += 1;
      }

      blocks.push(`<blockquote>${quoteLines.map(renderInlineMarkdown).join("<br>")}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${renderInlineMarkdown(lines[index].trim().replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }

      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length && lines[index].trim()) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push(`<p>${paragraphLines.map(renderInlineMarkdown).join("<br>")}</p>`);
  }

  return blocks.join("");
}

function getImageHtml(image: UploadedImage) {
  const alt = (image.alt ?? image.name.replace(/\.[^.]+$/, "")) || "图片";
  const url = image.localPreviewUrl ?? image.url;

  return `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"><figcaption>${escapeHtml(alt)}</figcaption></figure>`;
}

export function RichTextEditor({ value, onChange, onImageFiles }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const nextHtml = normalizeEditorHtml(value);

    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }, [value]);

  function saveSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function restoreSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection) {
      return;
    }

    editor.focus();

    if (savedRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function emitChange() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    onChange(cleanEmptyHtml(editor.innerHTML));
  }

  function runCommand(command: string, valueArg?: string) {
    restoreSelection();
    document.execCommand(command, false, valueArg);
    emitChange();
    saveSelection();
  }

  function insertHtml(html: string) {
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    emitChange();
    saveSelection();
  }

  function applyHeading() {
    runCommand("formatBlock", "h2");
  }

  function applyQuote() {
    runCommand("formatBlock", "blockquote");
  }

  function applyLink() {
    restoreSelection();
    const selectionText = window.getSelection()?.toString().trim();
    const url = window.prompt("输入链接地址");

    if (!url?.trim()) {
      return;
    }

    if (!selectionText) {
      insertHtml(`<a href="${escapeHtml(url.trim())}">${escapeHtml(url.trim())}</a>`);
      return;
    }

    document.execCommand("createLink", false, url.trim());
    emitChange();
    saveSelection();
  }

  async function handleMarkdownImport(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    const text = await file.text();
    insertHtml(sanitizePastedHtml(markdownToHtml(text)));
  }

  function handleImageFiles(files: FileList | null) {
    onImageFiles(files, {
      onLocalImages: (images) => {
        insertHtml(images.map(getImageHtml).join(""));
      }
    });
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      insertHtml(sanitizePastedHtml(html));
      return;
    }

    insertHtml(markdownToHtml(text));
  }

  const isEmpty = !value.trim();

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-2 py-1">
        <button
          type="button"
          title="加粗"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("bold")}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="斜体"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("italic")}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="标题"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applyHeading}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="列表"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("insertUnorderedList")}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="链接"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applyLink}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="引用"
          onMouseDown={(event) => event.preventDefault()}
          onClick={applyQuote}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="插入图片"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            saveSelection();
            imageInputRef.current?.click();
          }}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="导入 .md 文件"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            saveSelection();
            markdownInputRef.current?.click();
          }}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <FileUp className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          title="撤销"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("undo")}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="重做"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("redo")}
          className="grid h-8 w-8 place-items-center rounded text-gray-600 transition hover:bg-white hover:text-gray-950"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            handleImageFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={markdownInputRef}
          type="file"
          accept=".md,text/markdown,text/plain"
          className="sr-only"
          onChange={(event) => {
            void handleMarkdownImport(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <div className="relative">
        {isEmpty && !isFocused ? (
          <div className="pointer-events-none absolute left-3 top-3 text-sm text-gray-400">
            粘贴文章、笔记、脚本或活动文案...
          </div>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-label="正文"
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => {
            setIsFocused(false);
            saveSelection();
          }}
          onFocus={() => setIsFocused(true)}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onPaste={handlePaste}
          className={cn(
            "rich-text-editor min-h-[310px] w-full overflow-auto px-3 py-3 text-sm leading-7 text-gray-900 outline-none",
            "[&_a]:text-sky-700 [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-sky-200 [&_blockquote]:bg-sky-50 [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:text-gray-700",
            "[&_figcaption]:border-t [&_figcaption]:border-gray-100 [&_figcaption]:bg-white [&_figcaption]:px-3 [&_figcaption]:py-2 [&_figcaption]:text-xs [&_figcaption]:text-gray-500",
            "[&_figure]:my-4 [&_figure]:overflow-hidden [&_figure]:rounded-md [&_figure]:border [&_figure]:border-gray-200 [&_figure]:bg-gray-50",
            "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:leading-7 [&_h2]:text-gray-950 [&_img]:max-h-[520px] [&_img]:w-full [&_img]:object-contain",
            "[&_li]:my-1 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-gray-950 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
          )}
        />
      </div>
      <div className="flex h-9 items-center justify-between border-t border-gray-100 px-3 text-xs text-gray-400">
        <span>正文内容已保留排版</span>
        <span>可插入图片和导入 .md</span>
      </div>
    </div>
  );
}
