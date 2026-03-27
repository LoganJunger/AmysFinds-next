import { NextRequest, NextResponse } from "next/server";
import { analyzeImage } from "@/lib/ai/analyze";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeImage(imageUrl);
    return NextResponse.json({ status: "success", analysis });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analysis failed";

    if (message.toLowerCase().includes("rate limit")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    if (message.toLowerCase().includes("billing")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
