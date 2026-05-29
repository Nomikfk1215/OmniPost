"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Step } from "@/types";
import { useWorkflow } from "./WorkflowProvider";

const steps: Array<{ id: Step; label: string }> = [
  { id: "input", label: "内容编辑" },
  { id: "adapt", label: "平台适配" },
  { id: "preview", label: "预览确认" },
  { id: "publish", label: "发布" }
];

const stepIndex: Record<Step, number> = {
  input: 0,
  adapt: 1,
  preview: 2,
  publish: 3
};

export function WorkflowGuide() {
  const { state } = useWorkflow();
  const current = stepIndex[state.step];

  return (
    <section className="panel flex min-h-[48px] items-center rounded-md px-3">
      <div className="flex w-full items-center gap-2 overflow-hidden">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-8 min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium transition",
                  done && "bg-emerald-50 text-emerald-700",
                  active && "bg-indigo-50 text-indigo-700",
                  !done && !active && "bg-gray-50 text-gray-500"
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : active && state.step === "adapt" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">{index + 1} {step.label}</span>
              </div>
              {index < steps.length - 1 ? (
                <span className="hidden shrink-0 text-gray-300 min-[1180px]:inline">→</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
