import { NextRequest, NextResponse } from "next/server";
import { toggleSold } from "@/lib/db/queries/items";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sold = await toggleSold(parseInt(id));
    return NextResponse.json({ sold });
  } catch {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
