"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { FileDropZone } from "@/components/admin/file-drop-zone";
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
      setError(message.includes("S3") ? message : `${message} Check S3 configuration.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FileDropZone
      accept="video/mp4,video/webm,video/quicktime"
      disabled={uploading}
      uploading={uploading}
      uploadLabel="Uploading video…"
      idleLabel={videoUrl ? "Drop a new video to replace" : "Drop video from your Mac, or click to browse"}
      hint="MP4, WebM, MOV · max 50 MB · optional"
      onFiles={(files) => void handleFile(files[0])}
    >
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
      {error && <p className="text-xs text-maroon">{error}</p>}
    </FileDropZone>
  );
}
