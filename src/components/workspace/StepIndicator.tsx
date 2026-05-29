"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflow } from "./WorkflowProvider";
import type { Step } from "@/types";

const steps: Array<{ id: Step; label: string }> = [
  { id: "input", label: "输入内容" },
  { id: "adapt", label: "平台适配" },
  { id: "preview", label: "预览确认" },
  { id: "publish", label: "模拟发布" }
];

const stepIndex: Record<Step, number> = {
  input: 0,
  adapt: 1,
  preview: 2,
  publish: 3
};

export function StepIndicator() {
  const { state } = useWorkflow();
  const current = stepIndex[state.step];

  return (
    <div className="panel rounded-md px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <div
              key={step.id}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-md px-3 py-2 text-sm",
                done && "bg-emerald-50 text-emerald-700",
                active && "bg-gray-950 text-white",
                !done && !active && "bg-gray-50 text-gray-500"
              )}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : active && state.step === "adapt" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="truncate">{step.label}</span>
            </div>
          );
        })}
        {state.statusMessage ? (
          <span className="ml-auto text-sm text-gray-500">{state.statusMessage}</span>
        ) : null}
      </div>
    </div>
  );
}
