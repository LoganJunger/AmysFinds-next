"use client";

import { useState, useRef } from "react";
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
  const [rotating, setRotating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  async function handleRotate(action: "cw" | "ccw" | "flip-h" | "flip-v") {
    setRotating(true);
    try {
      // Load image onto canvas
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = toImageUrl(imageUrl);
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      const isRotation = action === "cw" || action === "ccw";
      canvas.width = isRotation ? img.height : img.width;
      canvas.height = isRotation ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      if (action === "cw") ctx.rotate(Math.PI / 2);
      else if (action === "ccw") ctx.rotate(-Math.PI / 2);
      else if (action === "flip-h") ctx.scale(-1, 1);
      else if (action === "flip-v") ctx.scale(1, -1);

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Convert canvas to blob and upload
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas to blob failed"))),
          "image/jpeg",
          0.9
        );
      });

      const file = new File([blob], "rotated.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setImageUrl(data.url);
      setImageBlobUrl(data.pathname);
      toast("Image updated");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Rotation failed", "error");
    } finally {
      setRotating(false);
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
      {/* Hidden canvas for image transforms */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image */}
      <div className="bg-white rounded-[var(--radius-lg)] shadow-card p-6">
        <label className="block text-sm font-medium text-text-secondary mb-3">
          Image
        </label>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-40 h-40 rounded-[var(--radius-lg)] overflow-hidden bg-surface-tertiary flex-shrink-0 relative">
            <img src={toImageUrl(imageUrl)} alt={item.title} className="w-full h-full object-cover" />
            {rotating && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary text-text-primary text-sm font-medium rounded-[var(--radius-md)] border border-border cursor-pointer hover:bg-surface-tertiary transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Replace Image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {/* Rotate / Flip buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={rotating}
                onClick={() => handleRotate("ccw")}
                className="p-2 text-text-tertiary hover:text-text-primary rounded-[var(--radius-md)] border border-border hover:bg-surface-secondary transition-colors disabled:opacity-50"
                title="Rotate left"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>
              <button
                type="button"
                disabled={rotating}
                onClick={() => handleRotate("cw")}
                className="p-2 text-text-tertiary hover:text-text-primary rounded-[var(--radius-md)] border border-border hover:bg-surface-secondary transition-colors disabled:opacity-50"
                title="Rotate right"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                </svg>
              </button>
              <button
                type="button"
                disabled={rotating}
                onClick={() => handleRotate("flip-h")}
                className="p-2 text-text-tertiary hover:text-text-primary rounded-[var(--radius-md)] border border-border hover:bg-surface-secondary transition-colors disabled:opacity-50"
                title="Flip horizontal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </button>
              <button
                type="button"
                disabled={rotating}
                onClick={() => handleRotate("flip-v")}
                className="p-2 text-text-tertiary hover:text-text-primary rounded-[var(--radius-md)] border border-border hover:bg-surface-secondary transition-colors disabled:opacity-50"
                title="Flip vertical"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-text-tertiary">
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
