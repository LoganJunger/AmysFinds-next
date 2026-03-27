"use server";

import { revalidatePath } from "next/cache";
import { toggleSold, deleteItem } from "@/lib/db/queries/items";
import { deleteImage } from "@/lib/blob/upload";
import { getItemById } from "@/lib/db/queries/items";

export async function toggleSoldAction(id: number) {
  const sold = await toggleSold(id);
  revalidatePath("/inventory");
  return sold;
}

export async function deleteItemAction(id: number) {
  const item = await getItemById(id);
  if (item?.image_blob_url) {
    await deleteImage(item.image_blob_url);
  }
  await deleteItem(id);
  revalidatePath("/inventory");
}
