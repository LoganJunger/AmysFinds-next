import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 16 * 1024 * 1024; // 16MB

export function validateImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPEG, PNG, WebP, or HEIC image."
    );
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image is too large. Maximum size is 16MB.");
  }
}

export async function uploadImage(
  file: File
): Promise<{ url: string; pathname: string }> {
  validateImage(file);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `items/${timestamp}-${safeName}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteImage(blobUrl: string): Promise<void> {
  try {
    await del(blobUrl);
  } catch {
    // Silently fail — image may already be deleted
  }
}
