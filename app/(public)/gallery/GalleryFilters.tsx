"use client";

import { useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function GalleryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/gallery?${params.toString()}`);
  }

  return (
    <div className="sticky top-16 z-20 bg-surface/95 backdrop-blur-sm py-4 mb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-border-light">
      <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search items..."
            defaultValue={currentSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams("search", e.currentTarget.value);
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <select
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="px-4 py-2.5 rounded-full border border-border bg-white text-sm text-text-secondary
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
