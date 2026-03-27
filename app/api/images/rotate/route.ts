import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, action } = await req.json();

    if (!imageUrl || !action) {
      return NextResponse.json(
        { error: "imageUrl and action are required" },
        { status: 400 }
      );
    }

    if (!["cw", "ccw", "flip-h", "flip-v"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    // Fetch the original image
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch original image" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imgRes.arrayBuffer());

    // Apply transform with sharp
    let image = sharp(buffer);

    switch (action) {
      case "cw":
        image = image.rotate(90);
        break;
      case "ccw":
        image = image.rotate(-90);
        break;
      case "flip-h":
        image = image.flop(); // horizontal flip
        break;
      case "flip-v":
        image = image.flip(); // vertical flip
        break;
    }

    const transformed = await image.jpeg({ quality: 90 }).toBuffer();

    // Upload the transformed image to Vercel Blob
    const timestamp = Date.now();
    const blob = await put(`items/rotated-${timestamp}.jpg`, transformed, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/jpeg",
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Rotation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
