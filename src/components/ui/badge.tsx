import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700",
        className
      )}
    >
      {children}
    </span>
  );
}
