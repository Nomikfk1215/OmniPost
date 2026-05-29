"use client";

import Image from "next/image";
import { FileImage, Sparkles, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { splitTags } from "@/lib/utils";
import { useWorkflow } from "./WorkflowProvider";

export function LeftPanel() {
  const { state, updateRaw, addImages, removeImage, loadSample } = useWorkflow();

  return (
    <section className="panel flex min-h-[680px] flex-col rounded-md">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-950">原始内容</h2>
          <p className="text-xs text-gray-400">标题、正文、图片、标签</p>
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
        <Field label="正文" hint="必填">
          <Textarea
            value={state.rawContent.body}
            onChange={(event) => updateRaw({ body: event.target.value })}
            placeholder="粘贴文章、笔记、脚本或活动文案..."
            className="min-h-[300px]"
          />
        </Field>
        <Field label="用户标签" hint="逗号或空格分隔">
          <Input
            value={state.rawContent.userTags.join("，")}
            onChange={(event) => updateRaw({ userTags: splitTags(event.target.value) })}
            placeholder="AI，学习效率，方法论"
          />
        </Field>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-gray-800">
            <span>图片素材</span>
            <span className="text-xs font-normal text-gray-400">可选</span>
          </div>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:bg-gray-100">
            <Upload className="h-5 w-5 text-gray-500" />
            <span className="mt-2 text-sm font-medium text-gray-700">上传图片</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => addImages(event.target.files)}
            />
          </label>
          {state.rawContent.images.length ? (
            <div className="grid grid-cols-2 gap-2">
              {state.rawContent.images.map((image) => (
                <div key={image.id} className="relative overflow-hidden rounded-md border border-gray-200">
                  <Image
                    src={image.url}
                    alt={image.name}
                    width={200}
                    height={140}
                    className="h-28 w-full object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    title="删除图片"
                    onClick={() => removeImage(image.id)}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-md bg-white/90 text-gray-600 shadow-sm hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">
              <FileImage className="h-4 w-4" />
              暂无图片素材
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
