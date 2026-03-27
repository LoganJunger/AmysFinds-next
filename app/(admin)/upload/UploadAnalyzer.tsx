"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveItemAction } from "./actions";
import { toast } from "@/app/components/Toast";

type Step = "upload" | "analyzing" | "review";

interface Analysis {
  title: string;
  description: string;
  price_range: string;
  refinishing_tips: string;
  posting_details: string;
  condition_notes: string;
  key_features: string[];
}

export default function UploadAnalyzer() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBlobUrl, setImageBlobUrl] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast("Please upload an image file", "error");
      return;
    }
    if (file.size > 16 * 1024 * 1024) {
      toast("Image is too large. Maximum size is 16MB.", "error");
      return;
    }

    setStep("analyzing");
    setProgress(10);

    try {
      // Upload to Vercel Blob
      const uploadForm = new FormData();
      uploadForm.append("image", file);
      setProgress(20);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      setImageUrl(uploadData.url);
      setImageBlobUrl(uploadData.pathname);
      setProgress(50);

      // Analyze with AI
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: uploadData.url }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error);

      setProgress(100);
      setAnalysis(analyzeData.analysis);
      setStep("review");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Analysis failed", "error");
      setStep("upload");
      setProgress(0);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("image_url", imageUrl);
      formData.set("image_blob_url", imageBlobUrl);
      await saveItemAction(formData);
      toast("Item added to inventory!");
      router.push("/inventory");
    } catch {
      toast("Failed to save item", "error");
      setSaving(false);
    }
  }

  function handleReset() {
    setStep("upload");
    setImageUrl("");
    setImageBlobUrl("");
    setAnalysis(null);
    setProgress(0);
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {step === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white rounded-[var(--radius-xl)] border-2 border-dashed p-12 text-center cursor-pointer
                      transition-all duration-200 ${
                        dragOver
                          ? "border-primary bg-primary-light scale-[1.01]"
                          : "border-border hover:border-primary/50 hover:bg-surface-secondary"
                      }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
          <p className="text-text-primary font-medium mb-1">
            Drop an image here or click to browse
          </p>
          <p className="text-sm text-text-tertiary">
            JPEG, PNG, WebP or HEIC &middot; Max 16MB
          </p>
        </div>
      )}

      {/* Analyzing */}
      {step === "analyzing" && (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-card p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-text-primary font-medium mb-2">Analyzing your item...</p>
          <p className="text-sm text-text-tertiary mb-4">
            AI is identifying the style, period, and value
          </p>
          <div className="max-w-xs mx-auto bg-surface-tertiary rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Review */}
      {step === "review" && analysis && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Image preview */}
          <div className="bg-white rounded-[var(--radius-xl)] shadow-card p-6">
            <div className="flex items-start gap-6">
              <div className="w-48 h-48 rounded-[var(--radius-lg)] overflow-hidden bg-surface-tertiary flex-shrink-0">
                <img
                  src={imageUrl}
                  alt="Uploaded item"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-light text-green-700 text-xs font-medium rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    AI Analysis Complete
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  Review and edit the details below, then save to your inventory.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 text-sm text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Upload a different image
                </button>
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="bg-white rounded-[var(--radius-xl)] shadow-card p-6 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1.5">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={analysis.title}
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
                defaultValue={analysis.description}
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
                  defaultValue={analysis.price_range}
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
                  defaultValue={analysis.condition_notes}
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
                defaultValue={analysis.refinishing_tips}
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
                defaultValue={analysis.posting_details}
                className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y"
              />
            </div>

            {/* Key features */}
            {analysis.key_features.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Key Features
                </label>
                <div className="flex flex-wrap gap-2">
                  {analysis.key_features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <input
              type="hidden"
              name="key_features"
              value={JSON.stringify(analysis.key_features || [])}
            />
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium
                         hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Save to Inventory
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 text-text-secondary text-sm font-medium rounded-[var(--radius-md)]
                         hover:bg-surface-tertiary transition-colors"
            >
              Start Over
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
