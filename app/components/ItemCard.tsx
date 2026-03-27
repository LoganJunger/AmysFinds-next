import Link from "next/link";
import { truncate } from "@/lib/utils";

interface Props {
  item: {
    id: number;
    title: string;
    description: string | null;
    price_range: string | null;
    image_url: string;
    sold: boolean;
  };
}

export default function ItemCard({ item }: Props) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group block bg-white rounded-[var(--radius-lg)] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-tertiary">
        {item.image_url && !item.image_url.startsWith("data:") ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}

        {/* Sold ribbon */}
        {item.sold && <div className="sold-ribbon">Sold</div>}

        {/* Price tag */}
        {item.price_range && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-700 shadow-sm">
            {item.price_range}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <span className="text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
            View Details
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-text-primary text-sm mb-1 truncate group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-text-tertiary line-clamp-2">
            {truncate(item.description, 120)}
          </p>
        )}
      </div>
    </Link>
  );
}
