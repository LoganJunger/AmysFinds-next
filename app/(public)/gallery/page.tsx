export const dynamic = "force-dynamic";

import { listActiveItems } from "@/lib/db/queries/items";
import ItemCard from "@/app/components/ItemCard";
import GalleryFilters from "./GalleryFilters";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const items = await listActiveItems(params.search, params.sort);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl text-text-primary mb-2">
            Our Collection
          </h1>
          <p className="text-text-secondary">
            Browse our curated selection of antique furniture
          </p>
        </div>

        {/* Filter bar */}
        <GalleryFilters />

        {/* Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface-tertiary flex items-center justify-center">
              <svg className="w-10 h-10 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg text-text-primary mb-2">No items found</h3>
            <p className="text-sm text-text-secondary">
              {params.search
                ? `No results for "${params.search}". Try a different search.`
                : "Check back soon for new additions!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
