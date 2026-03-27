import Link from "next/link";
import { truncate } from "@/lib/utils";
import { imageUrl } from "@/lib/blob/url";

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
        <img
          src={imageUrl(item.image_url)}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

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
