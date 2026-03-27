export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getItemById, incrementViewCount } from "@/lib/db/queries/items";
import { imageUrl } from "@/lib/blob/url";
import InquiryForm from "./InquiryForm";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(parseInt(id));
  if (!item) notFound();

  // Increment view count on every page load
  await incrementViewCount(item.id);

  const phone = process.env.CONTACT_PHONE || "802-318-0835";

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-[var(--radius-xl)] overflow-hidden bg-surface-tertiary shadow-lg">
              <img
                src={imageUrl(item.image_url)}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {item.sold && <div className="sold-ribbon">Sold</div>}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl text-text-primary mb-3">{item.title}</h1>
              {item.price_range && (
                <span className="inline-flex items-center px-4 py-1.5 bg-primary-light text-primary text-lg font-semibold rounded-full">
                  {item.price_range}
                </span>
              )}
            </div>

            {item.description && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-text-primary leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Key features */}
            {item.key_features && item.key_features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Key Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.key_features.map((feature, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-surface-tertiary text-text-primary text-sm rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Condition */}
            {item.condition_notes && (
              <div className="bg-info-light rounded-[var(--radius-lg)] p-4">
                <h3 className="text-sm font-semibold text-info mb-1">
                  Condition Notes
                </h3>
                <p className="text-sm text-text-secondary">
                  {item.condition_notes}
                </p>
              </div>
            )}

            {/* Refinishing tips */}
            {item.refinishing_tips && (
              <div>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Refinishing Tips
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.refinishing_tips}
                </p>
              </div>
            )}

            {/* Contact actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border-light">
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold
                           hover:bg-primary-hover transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call
              </a>
              <a
                href={`sms:${phone}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary border border-primary rounded-full text-sm font-semibold
                           hover:bg-primary-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Text
              </a>
            </div>

            {/* Inquiry form */}
            <InquiryForm itemId={item.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
