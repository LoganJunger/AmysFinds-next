"use client";

import { markReadAction } from "./actions";

interface Props {
  inquiry: {
    id: number;
    item_title?: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    read: boolean;
    created_at_formatted: string;
  };
}

export default function InquiryRow({ inquiry }: Props) {
  return (
    <div className={`px-6 py-4 ${inquiry.read ? "" : "bg-primary-light/30"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!inquiry.read && (
              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
            <p className="text-sm font-medium text-text-primary truncate">
              {inquiry.name}
            </p>
            <span className="text-xs text-text-tertiary">&middot;</span>
            <a
              href={`mailto:${inquiry.email}`}
              className="text-xs text-primary hover:underline truncate"
            >
              {inquiry.email}
            </a>
            {inquiry.phone && (
              <>
                <span className="text-xs text-text-tertiary">&middot;</span>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="text-xs text-text-secondary hover:underline"
                >
                  {inquiry.phone}
                </a>
              </>
            )}
          </div>
          {inquiry.item_title && (
            <p className="text-xs text-text-tertiary mb-1">
              Re: {inquiry.item_title}
            </p>
          )}
          <p className="text-sm text-text-secondary">{inquiry.message}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-text-tertiary whitespace-nowrap">
            {inquiry.created_at_formatted}
          </span>
          {!inquiry.read && (
            <button
              onClick={() => markReadAction(inquiry.id)}
              className="text-xs text-primary hover:underline whitespace-nowrap"
            >
              Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
