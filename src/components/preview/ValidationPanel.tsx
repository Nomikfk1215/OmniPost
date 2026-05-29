import { AlertTriangle, CheckCircle2, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidationCheck } from "@/types";

function getIcon(level: ValidationCheck["level"]) {
  if (level === "error") {
    return <CircleX className="h-4 w-4 text-rose-600" />;
  }

  if (level === "warning") {
    return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  }

  return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
}

export function ValidationPanel({ checks }: { checks: ValidationCheck[] }) {
  return (
    <div className="space-y-2">
      {checks.map((check) => (
        <div
          key={check.id}
          className={cn(
            "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
            check.level === "error" && "border-rose-200 bg-rose-50 text-rose-900",
            check.level === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
            check.level === "pass" && "border-emerald-100 bg-emerald-50 text-emerald-900"
          )}
        >
          <span className="mt-0.5">{getIcon(check.level)}</span>
          <span>{check.message}</span>
        </div>
      ))}
    </div>
  );
}
