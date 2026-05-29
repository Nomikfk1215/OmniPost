import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-sm font-medium text-gray-800">
        {label}
        {hint ? <span className="text-xs font-normal text-gray-400">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
