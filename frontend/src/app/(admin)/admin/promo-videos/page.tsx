"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { FieldLabel } from "@/components/admin/field-label";
import { FileDropZone } from "@/components/admin/file-drop-zone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  createPromoVideo,
  deletePromoVideo,
  fetchAdminPromoVideos,
  updatePromoVideo,
  uploadPromoVideo,
  uploadCategoryImage,
} from "@/lib/api/services/admin.service";
import type { PromoVideo, UpsertPromoVideoPayload } from "@/types/promo-video";

const inputClass = "admin-input";

const emptyForm = (): UpsertPromoVideoPayload & { id?: string } => ({
  title: "",
  description: "",
  videoUrl: "",
  posterUrl: null,
  displayOrder: 0,
  active: true,
});

export default function AdminPromoVideosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm());
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videos = useQuery({
    queryKey: ["admin", "promo-videos"],
    queryFn: fetchAdminPromoVideos,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "promo-videos"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: UpsertPromoVideoPayload = {
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        videoUrl: form.videoUrl,
        posterUrl: form.posterUrl || null,
        displayOrder: form.displayOrder ?? 0,
        active: form.active ?? true,
      };
      if (form.id) {
        return updatePromoVideo(form.id, payload);
      }
      return createPromoVideo(payload);
    },
    onSuccess: () => {
      invalidate();
      setForm(emptyForm());
      setError(null);
      toast(form.id ? "Promo video updated" : "Promo video added");
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to save promo video.");
      toast("Failed to save promo video", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromoVideo,
    onSuccess: () => {
      invalidate();
      toast("Promo video deleted");
      if (form.id) setForm(emptyForm());
    },
    onError: () => toast("Failed to delete promo video", "error"),
  });

  const handleVideoUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingVideo(true);
    setError(null);
    try {
      const result = await uploadPromoVideo(file);
      setForm((current) => ({ ...current, videoUrl: result.url }));
      toast("Video uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePosterUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingPoster(true);
    setError(null);
    try {
      const result = await uploadCategoryImage(file);
      setForm((current) => ({ ...current, posterUrl: result.url }));
      toast("Poster image uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Poster upload failed");
    } finally {
      setUploadingPoster(false);
    }
  };

  const startEdit = (video: PromoVideo) => {
    setForm({
      id: video.id,
      title: video.title,
      description: video.description ?? "",
      videoUrl: video.videoUrl,
      posterUrl: video.posterUrl,
      displayOrder: video.displayOrder,
      active: video.active,
    });
    setError(null);
  };

  const canSave = form.title.trim() && form.videoUrl;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Content</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Homepage promo videos</h1>
        <p className="mt-1 text-sm text-stone">
          Add a title, drag a video from your Mac, then save. Poster image is optional.
        </p>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="font-display text-lg text-charcoal">
          {form.id ? "Edit promo video" : "Add promo video"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Bridal collection showcase"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel optional>Description</FieldLabel>
            <textarea
              className={`${inputClass} min-h-20`}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short caption shown under the video on the homepage"
            />
          </div>
          <div>
            <FieldLabel optional>Display order</FieldLabel>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.displayOrder ?? 0}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={form.active ?? true}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Show on homepage
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <FieldLabel>Video</FieldLabel>
            <div className="mt-2">
              <FileDropZone
                accept="video/mp4,video/webm,video/quicktime"
                disabled={uploadingVideo}
                uploading={uploadingVideo}
                uploadLabel="Uploading video…"
                idleLabel={
                  form.videoUrl
                    ? "Drop a new video to replace"
                    : "Drop video from your Mac, or click to browse"
                }
                hint="MP4, WebM, MOV · max 50 MB"
                onFiles={(files) => void handleVideoUpload(files[0])}
              >
                {form.videoUrl && (
                  <video
                    src={form.videoUrl}
                    controls
                    className="max-h-48 w-full rounded-xl border border-charcoal/10 bg-charcoal"
                  />
                )}
              </FileDropZone>
            </div>
          </div>
          <div>
            <FieldLabel optional>Poster image</FieldLabel>
            <div className="mt-2">
              <FileDropZone
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPoster}
                uploading={uploadingPoster}
                uploadLabel="Uploading poster…"
                idleLabel={
                  form.posterUrl
                    ? "Drop a new poster to replace"
                    : "Drop poster from your Mac, or click to browse"
                }
                hint="JPEG, PNG, WebP · optional"
                onFiles={(files) => void handlePosterUpload(files[0])}
              >
                {form.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.posterUrl}
                    alt="Poster preview"
                    className="max-h-48 w-full rounded-xl border border-charcoal/10 object-cover"
                  />
                )}
              </FileDropZone>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-maroon">{error}</p>}
        {!canSave && form.title.trim() && !form.videoUrl && (
          <p className="text-sm text-stone">Upload a video to save this promo.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !canSave}
          >
            {saveMutation.isPending ? "Saving…" : form.id ? "Update video" : "Add video"}
          </Button>
          {form.id && (
            <Button type="button" variant="outline" onClick={() => setForm(emptyForm())}>
              Cancel edit
            </Button>
          )}
        </div>
      </div>

      <div className="admin-card overflow-x-auto !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-charcoal/5 text-eyebrow text-stone">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-stone">
                  Loading…
                </td>
              </tr>
            ) : videos.data?.length ? (
              videos.data.map((video) => (
                <tr key={video.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="px-4 py-3 text-stone">{video.displayOrder}</td>
                  <td className="px-4 py-3 text-charcoal">{video.title}</td>
                  <td className="px-4 py-3">
                    <span className="chip">{video.active ? "Active" : "Hidden"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(video)}
                        className="text-maroon hover:underline"
                        aria-label={`Edit ${video.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${video.title}"?`)) {
                            deleteMutation.mutate(video.id);
                          }
                        }}
                        className="text-maroon hover:underline"
                        aria-label={`Delete ${video.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-stone">
                  No promo videos yet. Upload one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
