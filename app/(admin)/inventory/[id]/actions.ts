"use server";

import { revalidatePath } from "next/cache";
import { updateItem } from "@/lib/db/queries/items";

export async function updateItemAction(id: number, formData: FormData) {
  await updateItem(id, {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price_range: formData.get("price_range") as string,
    refinishing_tips: formData.get("refinishing_tips") as string,
    posting_details: formData.get("posting_details") as string,
    condition_notes: formData.get("condition_notes") as string,
    key_features: JSON.parse(
      (formData.get("key_features") as string) || "[]"
    ),
    image_url: formData.get("image_url") as string,
    image_blob_url: (formData.get("image_blob_url") as string) || undefined,
    active: formData.get("active") === "true",
  });

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
  revalidatePath("/gallery");
}
