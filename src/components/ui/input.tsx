"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
