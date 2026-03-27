/**
 * Convert a private blob URL to a proxied URL via our API.
 * If the URL is not a private blob URL, return it as-is.
 */
export function imageUrl(url: string | null): string {
  if (!url) return "/images/default-item.svg";
  if (url.startsWith("data:")) return "/images/default-item.svg";
  if (url.includes(".private.blob.vercel-storage.com")) {
    return `/api/images?url=${encodeURIComponent(url)}`;
  }
  return url;
}
