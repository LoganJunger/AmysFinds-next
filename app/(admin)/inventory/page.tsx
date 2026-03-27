export const dynamic = "force-dynamic";

import Link from "next/link";
import { listAllItems } from "@/lib/db/queries/items";
import { formatDate } from "@/lib/utils";
import InventoryActions from "./InventoryActions";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; search?: string }>;
}) {
  const params = await searchParams;
  const items = await listAllItems(params.filter, params.search);

  const filters = [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "sold", label: "Sold" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-text-primary">Inventory</h1>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Item
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form className="flex-1 min-w-[200px] max-w-sm">
          <input
            name="search"
            type="text"
            placeholder="Search items..."
            defaultValue={params.search}
            className="w-full px-4 py-2 text-sm rounded-[var(--radius-md)] border border-border bg-white
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {params.filter && (
            <input type="hidden" name="filter" value={params.filter} />
          )}
        </form>
        <div className="flex gap-1 bg-white rounded-[var(--radius-md)] p-1 border border-border">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/inventory?filter=${f.value}${params.search ? `&search=${params.search}` : ""}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-colors ${
                (params.filter || "") === f.value
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-lg)] shadow-card p-12 text-center">
          <p className="text-text-tertiary text-sm mb-4">No items found</p>
          <Link
            href="/upload"
            className="text-primary text-sm font-medium hover:underline"
          >
            Add your first item
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-lg)] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-secondary">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Item</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary hidden md:table-cell">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-text-secondary hidden lg:table-cell">Views</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] overflow-hidden bg-surface-tertiary flex-shrink-0">
                          {item.image_url && !item.image_url.startsWith("data:") ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-surface-tertiary" />
                          )}
                        </div>
                        <span className="font-medium text-text-primary truncate max-w-[200px]">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {item.price_range || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary hidden md:table-cell">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {item.sold ? (
                        <span className="inline-block text-xs font-medium bg-warning-light text-amber-700 px-2.5 py-1 rounded-full">
                          Sold
                        </span>
                      ) : item.active ? (
                        <span className="inline-block text-xs font-medium bg-success-light text-green-700 px-2.5 py-1 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block text-xs font-medium bg-surface-tertiary text-text-tertiary px-2.5 py-1 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-text-tertiary hidden lg:table-cell">
                      {item.view_count}
                    </td>
                    <td className="px-4 py-3">
                      <InventoryActions item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
