/**
 * Normalize an image URL for display.
 * Public blob URLs are directly accessible.
 */
export function imageUrl(url: string | null): string {
  if (!url) return "/images/default-item.svg";
  if (url.startsWith("data:")) return "/images/default-item.svg";
  return url;
}
