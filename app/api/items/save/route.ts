import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createItem } from "@/lib/db/queries/items";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized — please log in first" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const imageUrl = formData.get("image_url") as string;
    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 });
    }

    const item = await createItem({
      title,
      description: (formData.get("description") as string) || undefined,
      price_range: (formData.get("price_range") as string) || undefined,
      refinishing_tips: (formData.get("refinishing_tips") as string) || undefined,
      posting_details: (formData.get("posting_details") as string) || undefined,
      condition_notes: (formData.get("condition_notes") as string) || undefined,
      key_features: JSON.parse((formData.get("key_features") as string) || "[]"),
      image_url: imageUrl,
      image_blob_url: (formData.get("image_blob_url") as string) || undefined,
    });

    revalidatePath("/");
    revalidatePath("/gallery");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return NextResponse.json({ id: item.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
