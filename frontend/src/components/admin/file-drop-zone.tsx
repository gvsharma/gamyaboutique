"use client";

import { Upload } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  uploading?: boolean;
  uploadLabel?: string;
  idleLabel?: string;
  hint?: string;
  className?: string;
  children?: ReactNode;
  onFiles: (files: FileList) => void;
}

export function FileDropZone({
  accept,
  multiple,
  disabled,
  uploading,
  uploadLabel = "Uploading…",
  idleLabel = "Drop files here or click to browse",
  hint,
  className,
  children,
  onFiles,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled || uploading || !e.dataTransfer.files?.length) return;
    onFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {children}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "admin-dropzone flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center text-sm transition-all",
          dragging && "border-maroon bg-maroon/5 text-maroon shadow-soft",
          !dragging && "border-charcoal/12 text-maroon hover:border-maroon/35 hover:bg-ivory/50",
          (disabled || uploading) && "pointer-events-none opacity-60",
        )}
      >
        <Upload className="h-5 w-5" strokeWidth={1.5} />
        <span className="font-medium">{uploading ? uploadLabel : idleLabel}</span>
        {hint && !uploading && <span className="text-xs text-stone">{hint}</span>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          disabled={disabled || uploading}
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
