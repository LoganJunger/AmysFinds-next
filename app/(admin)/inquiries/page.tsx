export const dynamic = "force-dynamic";

import { listInquiries } from "@/lib/db/queries/inquiries";
import { formatDate } from "@/lib/utils";
import InquiryRow from "./InquiryRow";

export default async function InquiriesPage() {
  const inquiries = await listInquiries();

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl text-text-primary">Inquiries</h1>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-lg)] shadow-card p-12 text-center">
          <p className="text-text-tertiary text-sm">No inquiries yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-lg)] shadow-card overflow-hidden">
          <div className="divide-y divide-border-light">
            {inquiries.map((inq) => (
              <InquiryRow
                key={inq.id}
                inquiry={{
                  ...inq,
                  created_at_formatted: formatDate(inq.created_at),
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
