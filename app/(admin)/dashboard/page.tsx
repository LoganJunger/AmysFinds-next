export const dynamic = "force-dynamic";

import Link from "next/link";
import { getStats, getRecentItems } from "@/lib/db/queries/items";
import { imageUrl } from "@/lib/blob/url";
import { getUnreadCount } from "@/lib/db/queries/inquiries";
import { formatRelativeDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [stats, recentItems, unreadInquiries] = await Promise.all([
    getStats(),
    getRecentItems(5),
    getUnreadCount(),
  ]);

  const statCards = [
    { label: "Total Items", value: stats.total, color: "bg-info-light text-info", icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" },
    { label: "Active Listings", value: stats.active, color: "bg-success-light text-green-600", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Sold", value: stats.sold, color: "bg-warning-light text-amber-600", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
    { label: "Added Today", value: stats.today, color: "bg-primary-light text-primary", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome back, Amy
          </p>
        </div>
        {unreadInquiries > 0 && (
          <Link
            href="/inquiries"
            className="flex items-center gap-2 px-4 py-2 bg-warning-light text-amber-700 rounded-[var(--radius-md)] text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            {unreadInquiries} new {unreadInquiries === 1 ? "inquiry" : "inquiries"}
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-[var(--radius-lg)] p-5 shadow-card hover:shadow-card-hover transition-shadow duration-200"
          >
            <div className={`w-10 h-10 ${card.color} rounded-[var(--radius-md)] flex items-center justify-center mb-3`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
            <p className="text-2xl font-semibold text-text-primary">{card.value}</p>
            <p className="text-xs text-text-tertiary mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-[var(--radius-md)] text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Item
        </Link>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-text-primary rounded-[var(--radius-md)] text-sm font-medium hover:bg-surface-tertiary transition-colors shadow-card border border-border"
        >
          View Inventory
        </Link>
        <Link
          href="/gallery"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-text-primary rounded-[var(--radius-md)] text-sm font-medium hover:bg-surface-tertiary transition-colors shadow-card border border-border"
        >
          Public Gallery
          <svg className="w-3.5 h-3.5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[var(--radius-lg)] shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg text-text-primary">Recent Activity</h2>
        </div>
        {recentItems.length === 0 ? (
          <div className="px-6 py-12 text-center text-text-tertiary text-sm">
            No items yet. Start by adding your first item!
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                href={`/inventory/${item.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-surface-secondary transition-colors"
              >
                <div className="w-12 h-12 rounded-[var(--radius-md)] overflow-hidden bg-surface-tertiary flex-shrink-0">
                  <img
                    src={imageUrl(item.image_url)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {item.price_range || "No price set"} &middot;{" "}
                    {formatRelativeDate(item.created_at)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {item.sold ? (
                    <span className="text-xs font-medium bg-warning-light text-amber-700 px-2.5 py-1 rounded-full">
                      Sold
                    </span>
                  ) : item.active ? (
                    <span className="text-xs font-medium bg-success-light text-green-700 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium bg-surface-tertiary text-text-tertiary px-2.5 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
