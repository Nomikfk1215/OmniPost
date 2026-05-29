"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
