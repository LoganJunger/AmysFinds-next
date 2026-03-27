import { NextRequest, NextResponse } from "next/server";
import { createInquiry } from "@/lib/db/queries/inquiries";
import { z } from "zod/v4";

const inquirySchema = z.object({
  item_id: z.number(),
  name: z.string().min(1).max(200),
  email: z.email().max(254),
  phone: z.string().max(30).optional(),
  message: z.string().min(1).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = inquirySchema.parse(body);
    await createInquiry(data);
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: e.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
