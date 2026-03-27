"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleSoldAction, deleteItemAction } from "./actions";
import ConfirmModal from "@/app/components/ConfirmModal";
import { toast } from "@/app/components/Toast";

interface Props {
  item: {
    id: number;
    title: string;
    sold: boolean;
  };
}

export default function InventoryActions({ item }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggleSold() {
    setLoading(true);
    const sold = await toggleSoldAction(item.id);
    toast(sold ? "Marked as sold" : "Marked as unsold");
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    await deleteItemAction(item.id);
    toast("Item deleted", "info");
    setDeleteOpen(false);
    setLoading(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/${item.id}`}
          className="p-1.5 text-text-tertiary hover:text-primary rounded-[var(--radius-sm)] hover:bg-primary-light transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </Link>
        <button
          onClick={handleToggleSold}
          disabled={loading}
          className="p-1.5 text-text-tertiary hover:text-amber-600 rounded-[var(--radius-sm)] hover:bg-warning-light transition-colors disabled:opacity-50"
          title={item.sold ? "Mark unsold" : "Mark sold"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </button>
        <Link
          href={`/api/items/${item.id}/pdf`}
          className="p-1.5 text-text-tertiary hover:text-info rounded-[var(--radius-sm)] hover:bg-info-light transition-colors"
          title="Download PDF"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </Link>
        <button
          onClick={() => setDeleteOpen(true)}
          disabled={loading}
          className="p-1.5 text-text-tertiary hover:text-danger rounded-[var(--radius-sm)] hover:bg-danger-light transition-colors disabled:opacity-50"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
