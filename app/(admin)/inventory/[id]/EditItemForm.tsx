"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateItemAction } from "./actions";
import { toast } from "@/app/components/Toast";
import { imageUrl as toImageUrl } from "@/lib/blob/url";
import type { InventoryItem } from "@/lib/db/queries/items";

export default function EditItemForm({ item }: { item: InventoryItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(item.image_url);
  const [imageBlobUrl, setImageBlobUrl] = useState(item.image_blob_url || "");
  const [active, setActive] = useState(item.active);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.url);
      setImageBlobUrl(data.pathname);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image_url", imageUrl);
    formData.set("image_blob_url", imageBlobUrl);
    formData.set("active", String(active));

    try {
      await updateItemAction(item.id, formData);
      toast("Item updated successfully");
      router.push("/inventory");
    } catch {
      toast("Failed to update item", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image */}
      <div className="bg-white rounded-[var(--radius-lg)] shadow-card p-6">
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Image
        </label>
        <div className="flex items-start gap-6">
          <div className="w-40 h-40 rounded-[var(--radius-lg)] overflow-hidden bg-surface-tertiary flex-shrink-0">
            <img src={toImageUrl(imageUrl)} alt={item.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary text-text-primary text-sm font-medium rounded-[var(--radius-md)] border border-border cursor-pointer hover:bg-surface-tertiary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Replace Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-xs text-text-tertiary mt-2">
              JPEG, PNG, WebP or HEIC. Max 16MB.
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-[var(--radius-lg)] shadow-card p-6 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1.5">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={item.title}
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={item.description || ""}
            className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="price_range" className="block text-sm font-medium text-text-secondary mb-1.5">
              Price Range
            </label>
            <input
              id="price_range"
              name="price_range"
              type="text"
              defaultValue={item.price_range || ""}
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
          </div>
          <div>
            <label htmlFor="condition_notes" className="block text-sm font-medium text-text-secondary mb-1.5">
              Condition Notes
            </label>
            <input
              id="condition_notes"
              name="condition_notes"
              type="text"
              defaultValue={item.condition_notes || ""}
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="refinishing_tips" className="block text-sm font-medium text-text-secondary mb-1.5">
            Refinishing Tips
          </label>
          <textarea
            id="refinishing_tips"
            name="refinishing_tips"
            rows={3}
            defaultValue={item.refinishing_tips || ""}
            className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y"
          />
        </div>

        <div>
          <label htmlFor="posting_details" className="block text-sm font-medium text-text-secondary mb-1.5">
            Posting Details
          </label>
          <textarea
            id="posting_details"
            name="posting_details"
            rows={3}
            defaultValue={item.posting_details || ""}
            className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y"
          />
        </div>

        <input
          type="hidden"
          name="key_features"
          value={JSON.stringify(item.key_features || [])}
        />

        {/* Active toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              active ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                active ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm text-text-secondary">
            {active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium
                     hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => router.push("/inventory")}
          className="px-6 py-2.5 text-text-secondary text-sm font-medium rounded-[var(--radius-md)]
                     hover:bg-surface-tertiary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
