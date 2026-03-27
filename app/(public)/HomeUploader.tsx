"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "@/app/components/Toast";

type Step = "upload" | "analyzing" | "review" | "saved";

interface Analysis {
  title: string;
  description: string;
  price_range: string;
  refinishing_tips: string;
  posting_details: string;
  condition_notes: string;
  key_features: string[];
}

export default function HomeUploader() {
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

    const formData = new FormData(e.currentTarget);
    formData.set("image_url", imageUrl);
    formData.set("image_blob_url", imageBlobUrl);

    try {
      const res = await fetch("/api/items/save", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast("Item added to inventory!");
      setStep("saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
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
    <section className="py-20 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl text-text-primary mb-2">
            Analyze Your Find
          </h2>
          <p className="text-text-secondary">
            Upload a photo and let AI identify the style, period, and value
          </p>
        </div>

        {/* Upload Zone */}
        {step === "upload" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-[var(--radius-xl)] border-2 border-dashed p-12 text-center cursor-pointer
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
          <div className="bg-surface-secondary rounded-[var(--radius-xl)] p-12 text-center">
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
          <form onSubmit={handleSave} className="space-y-6 animate-fade-in">
            <div className="bg-surface-secondary rounded-[var(--radius-xl)] p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-full sm:w-48 h-48 rounded-[var(--radius-lg)] overflow-hidden bg-surface-tertiary flex-shrink-0">
                  <img src={imageUrl} alt="Uploaded item" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-light text-green-700 text-xs font-medium rounded-full mb-3">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    AI Analysis Complete
                  </span>
                  <p className="text-sm text-text-secondary">
                    Review the details below, edit if needed, then save to inventory.
                  </p>
                  <button type="button" onClick={handleReset} className="mt-2 text-sm text-text-tertiary hover:text-text-primary transition-colors">
                    Upload a different image
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-secondary rounded-[var(--radius-xl)] p-6 space-y-5">
              <div>
                <label htmlFor="home-title" className="block text-sm font-medium text-text-secondary mb-1.5">Title</label>
                <input id="home-title" name="title" type="text" required defaultValue={analysis.title} maxLength={200}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
              </div>

              <div>
                <label htmlFor="home-desc" className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                <textarea id="home-desc" name="description" rows={3} defaultValue={analysis.description}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="home-price" className="block text-sm font-medium text-text-secondary mb-1.5">Price Range</label>
                  <input id="home-price" name="price_range" type="text" defaultValue={analysis.price_range} maxLength={100}
                    className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label htmlFor="home-cond" className="block text-sm font-medium text-text-secondary mb-1.5">Condition</label>
                  <input id="home-cond" name="condition_notes" type="text" defaultValue={analysis.condition_notes}
                    className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
                </div>
              </div>

              <div>
                <label htmlFor="home-tips" className="block text-sm font-medium text-text-secondary mb-1.5">Refinishing Tips</label>
                <textarea id="home-tips" name="refinishing_tips" rows={2} defaultValue={analysis.refinishing_tips}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y" />
              </div>

              <div>
                <label htmlFor="home-posting" className="block text-sm font-medium text-text-secondary mb-1.5">Posting Details</label>
                <textarea id="home-posting" name="posting_details" rows={2} defaultValue={analysis.posting_details}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm resize-y" />
              </div>

              {analysis.key_features.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Key Features</label>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_features.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <input type="hidden" name="key_features" value={JSON.stringify(analysis.key_features || [])} />
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save to Inventory
              </button>
              <button type="button" onClick={handleReset}
                className="px-6 py-2.5 text-text-secondary text-sm font-medium rounded-[var(--radius-md)] hover:bg-surface-tertiary transition-colors">
                Start Over
              </button>
            </div>
          </form>
        )}

        {/* Saved confirmation */}
        {step === "saved" && (
          <div className="bg-success-light rounded-[var(--radius-xl)] p-12 text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl text-text-primary mb-2">Item Added!</h3>
            <p className="text-sm text-text-secondary mb-6">Your item has been saved to inventory.</p>
            <button onClick={handleReset}
              className="px-6 py-2.5 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium hover:bg-primary-hover transition-colors">
              Analyze Another Item
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
