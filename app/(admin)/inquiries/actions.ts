"use server";

import { revalidatePath } from "next/cache";
import { markInquiryRead } from "@/lib/db/queries/inquiries";

export async function markReadAction(id: number) {
  await markInquiryRead(id);
  revalidatePath("/inquiries");
}
