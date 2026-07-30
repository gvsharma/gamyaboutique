import type { ReactNode } from "react";

interface FieldLabelProps {
  children: ReactNode;
  optional?: boolean;
  hint?: string;
}

export function FieldLabel({ children, optional, hint }: FieldLabelProps) {
  return (
    <div>
      <span className="text-eyebrow text-stone">
        {children}
        {optional && (
          <span className="ml-1.5 font-normal normal-case tracking-normal text-stone/60">
            optional
          </span>
        )}
      </span>
      {hint && <p className="mt-0.5 text-xs text-stone/80">{hint}</p>}
    </div>
  );
}
