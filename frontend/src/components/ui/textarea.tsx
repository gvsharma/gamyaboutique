"use client";

import { forwardRef, TextareaHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id: idProp, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div>
        <div className="relative">
          <textarea
            ref={ref}
            id={id}
            placeholder=" "
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "input-premium peer min-h-[7rem] resize-none pt-6 pb-3 placeholder-transparent",
              error && "border-red-300/60 focus:border-red-300 focus:ring-red-100",
              className,
            )}
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-4 top-4 origin-left text-sm text-stone transition-all duration-300 ease-premium",
              "peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-wider",
              "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider",
            )}
          >
            {label}
          </label>
        </div>
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600/80" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
