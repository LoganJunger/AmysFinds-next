"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-green-700 mb-2">Amy&apos;s Finds</h1>
          <p className="text-text-secondary text-sm">Admin Login</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[var(--radius-xl)] shadow-card p-8 space-y-5"
        >
          {error && (
            <div className="bg-danger-light text-danger text-sm rounded-[var(--radius-md)] px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-secondary mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border bg-surface
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         transition-all duration-200"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary text-white rounded-[var(--radius-md)] font-medium
                       hover:bg-primary-hover transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-text-tertiary text-xs mt-6">
          &copy; {new Date().getFullYear()} Amy&apos;s Finds
        </p>
      </div>
    </div>
  );
}
