"use client";

import { useState } from "react";

export default function InquiryForm({ itemId }: { itemId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: itemId,
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-success-light rounded-[var(--radius-lg)] p-6 text-center animate-scale-in">
        <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg text-text-primary mb-1">Message Sent!</h3>
        <p className="text-sm text-text-secondary">
          We&apos;ll get back to you as soon as possible.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 bg-secondary text-white rounded-[var(--radius-md)] text-sm font-semibold
                   hover:bg-secondary-hover transition-colors"
      >
        Send an Inquiry
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-border rounded-[var(--radius-lg)] p-6 space-y-4 animate-fade-in-up"
    >
      <h3 className="text-lg text-text-primary">Send an Inquiry</h3>

      {error && (
        <div className="text-sm text-danger bg-danger-light px-4 py-2 rounded-[var(--radius-md)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      <input
        name="phone"
        type="tel"
        placeholder="Phone (optional)"
        className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
      <textarea
        name="message"
        required
        rows={3}
        placeholder="Your message..."
        className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-y"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium
                     hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          Send Message
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2.5 text-text-secondary text-sm rounded-[var(--radius-md)]
                     hover:bg-surface-tertiary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
