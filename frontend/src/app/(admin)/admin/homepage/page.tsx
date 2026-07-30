"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FieldLabel } from "@/components/admin/field-label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  fetchAdminCollections,
  fetchAdminHomepageSlots,
  updateAdminHomepageSlot,
} from "@/lib/api/services/admin.service";

const inputClass = "admin-input";

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const slots = useQuery({
    queryKey: ["admin", "homepage-slots"],
    queryFn: fetchAdminHomepageSlots,
  });

  const collections = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: fetchAdminCollections,
  });

  const featuredSlot = slots.data?.find((s) => s.slotKey === "FEATURED_COLLECTION");
  const curatedSlot = slots.data?.find((s) => s.slotKey === "CURATED_EDIT");

  const [featuredSlug, setFeaturedSlug] = useState("");
  const [curatedTitle, setCuratedTitle] = useState("");
  const [curatedSubtitle, setCuratedSubtitle] = useState("");
  const [curatedCollectionSlug, setCuratedCollectionSlug] = useState("");
  const [productIdsText, setProductIdsText] = useState("");

  useEffect(() => {
    if (featuredSlot) setFeaturedSlug(featuredSlot.collectionSlug ?? "");
    if (curatedSlot) {
      setCuratedTitle(curatedSlot.title ?? "");
      setCuratedSubtitle(curatedSlot.subtitle ?? "");
      setCuratedCollectionSlug(curatedSlot.collectionSlug ?? "");
      setProductIdsText(curatedSlot.productIds?.join(", ") ?? "");
    }
  }, [featuredSlot, curatedSlot]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateAdminHomepageSlot("FEATURED_COLLECTION", {
        collectionSlug: featuredSlug || null,
        active: true,
      });
      const productIds = productIdsText
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      await updateAdminHomepageSlot("CURATED_EDIT", {
        title: curatedTitle || null,
        subtitle: curatedSubtitle || null,
        collectionSlug: curatedCollectionSlug || null,
        productIds: productIds.length ? productIds : [],
        active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "homepage-slots"] });
      toast("Homepage updated");
    },
    onError: () => toast("Failed to update homepage", "error"),
  });

  const activeCollections = collections.data?.filter((c) => c.active) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-eyebrow">Merchandising</p>
        <h1 className="mt-2 font-display text-section-title text-charcoal">Homepage</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone">
          Curate what appears on the storefront homepage — featured collection spotlight and the
          editor&apos;s pick carousel.
        </p>
      </div>

      <div className="admin-card space-y-6">
        <h2 className="font-display text-lg text-charcoal">Featured collection</h2>
        <p className="text-sm text-stone">
          Large editorial spotlight on the homepage. Pick an active collection with a cover image.
        </p>
        <div>
          <FieldLabel>Collection</FieldLabel>
          <select className={inputClass} value={featuredSlug} onChange={(e) => setFeaturedSlug(e.target.value)}>
            <option value="">— None (section hidden) —</option>
            {activeCollections.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({c.collectionType})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card space-y-6">
        <h2 className="font-display text-lg text-charcoal">Editor&apos;s pick carousel</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel optional>Eyebrow label</FieldLabel>
            <input
              className={inputClass}
              value={curatedTitle}
              onChange={(e) => setCuratedTitle(e.target.value)}
              placeholder="Editor's pick"
            />
          </div>
          <div>
            <FieldLabel optional>Title</FieldLabel>
            <input
              className={inputClass}
              value={curatedSubtitle}
              onChange={(e) => setCuratedSubtitle(e.target.value)}
              placeholder="Pieces we love this season"
            />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel optional hint="Products from this collection if no manual IDs below">
              Source collection
            </FieldLabel>
            <select
              className={inputClass}
              value={curatedCollectionSlug}
              onChange={(e) => setCuratedCollectionSlug(e.target.value)}
            >
              <option value="">— Use latest shop products —</option>
              {activeCollections.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <FieldLabel
              optional
              hint="Comma-separated product IDs for manual curation (overrides collection)"
            >
              Product IDs
            </FieldLabel>
            <textarea
              className={`${inputClass} min-h-20 font-mono text-xs`}
              value={productIdsText}
              onChange={(e) => setProductIdsText(e.target.value)}
              placeholder="uuid-1, uuid-2, uuid-3"
            />
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending || slots.isLoading}
      >
        {saveMutation.isPending ? "Saving…" : "Save homepage"}
      </Button>
    </div>
  );
}
