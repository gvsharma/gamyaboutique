"use client";

import { Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { uploadProductVideo } from "@/lib/api/services/admin.service";

interface VideoUploaderProps {
  videoUrl: string | null;
  onChange: (url: string | null) => void;
}

export function VideoUploader({ videoUrl, onChange }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadProductVideo(file);
      onChange(result.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Video upload failed.";
      setError(message.includes("S3") ? message : `${message} Check S3 config on the backend.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {videoUrl && (
        <div className="space-y-2">
          <video
            src={videoUrl}
            controls
            className="max-h-48 w-full rounded-xl border border-charcoal/10 bg-charcoal"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 text-xs text-maroon hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            Remove video
          </button>
        </div>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-charcoal/15 px-4 py-3 text-sm text-maroon transition-colors hover:border-maroon/30 hover:bg-ivory/60">
        <Upload className="h-4 w-4" />
        {uploading ? "Uploading video…" : videoUrl ? "Replace video" : "Upload video"}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>

      {error && <p className="text-xs text-maroon">{error}</p>}
      <p className="text-xs text-stone">Optional product video (MP4, WebM, or MOV). Max 50 MB.</p>
    </div>
  );
}
