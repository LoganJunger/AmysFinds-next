export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getItemById } from "@/lib/db/queries/items";
import EditItemForm from "./EditItemForm";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItemById(parseInt(id));
  if (!item) notFound();

  return (
    <div className="max-w-3xl animate-fade-in">
      <h1 className="text-2xl text-text-primary mb-6">Edit Item</h1>
      <EditItemForm item={item} />
    </div>
  );
}
