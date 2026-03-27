/**
 * One-time migration script to move data from old Replit PostgreSQL
 * (with base64 images) to new Neon DB + Vercel Blob.
 *
 * Usage:
 *   DATABASE_URL_OLD=postgres://... DATABASE_URL=postgres://... BLOB_READ_WRITE_TOKEN=vercel_blob_... npx tsx scripts/migrate-images.ts
 */

import { Pool } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

interface OldItem {
  id: number;
  title: string;
  description: string | null;
  price_range: string | null;
  refinishing_tips: string | null;
  posting_details: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  sold: boolean;
  sold_at: string | null;
  view_count: number;
}

async function main() {
  const oldDbUrl = process.env.DATABASE_URL_OLD;
  const newDbUrl = process.env.DATABASE_URL;

  if (!oldDbUrl) throw new Error("DATABASE_URL_OLD is required");
  if (!newDbUrl) throw new Error("DATABASE_URL is required");
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error("BLOB_READ_WRITE_TOKEN is required");

  const oldPool = new Pool({ connectionString: oldDbUrl });
  const newPool = new Pool({ connectionString: newDbUrl });

  console.log("Fetching items from old database...");

  // The old Flask app uses SQLAlchemy model name "InventoryItem" which maps to table "inventory_item"
  const oldItems = await oldPool.query<OldItem>(
    "SELECT * FROM inventory_item ORDER BY id"
  );

  console.log(`Found ${oldItems.rows.length} items to migrate.`);

  let migrated = 0;
  let skipped = 0;

  for (const item of oldItems.rows) {
    try {
      let imageUrl = "";
      let imageBlobUrl = "";

      if (item.image_url && item.image_url.startsWith("data:image/")) {
        // Decode base64 and upload to Vercel Blob
        const base64Match = item.image_url.match(
          /^data:image\/\w+;base64,(.+)$/
        );
        if (base64Match) {
          const buffer = Buffer.from(base64Match[1], "base64");
          const filename = `migrated/item-${item.id}.jpg`;

          console.log(
            `  Uploading image for item ${item.id} (${(buffer.length / 1024).toFixed(0)}KB)...`
          );

          const blob = await put(filename, buffer, {
            access: "public",
            contentType: "image/jpeg",
            addRandomSuffix: true,
          });

          imageUrl = blob.url;
          imageBlobUrl = blob.pathname;
        }
      } else if (item.image_url) {
        // Already a URL — keep it
        imageUrl = item.image_url;
      }

      if (!imageUrl) {
        console.log(`  Skipping item ${item.id} "${item.title}" — no image`);
        skipped++;
        continue;
      }

      // Insert into new database
      await newPool.query(
        `INSERT INTO inventory_items (title, description, price_range, refinishing_tips, posting_details, image_url, image_blob_url, created_at, updated_at, active, sold, sold_at, view_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          item.title,
          item.description,
          item.price_range,
          item.refinishing_tips,
          item.posting_details,
          imageUrl,
          imageBlobUrl || null,
          item.created_at,
          item.updated_at,
          item.active,
          item.sold,
          item.sold_at,
          item.view_count,
        ]
      );

      migrated++;
      console.log(`  Migrated item ${item.id}: "${item.title}"`);
    } catch (err) {
      console.error(`  ERROR migrating item ${item.id}:`, err);
      skipped++;
    }
  }

  console.log(`\nDone! Migrated: ${migrated}, Skipped: ${skipped}`);

  await oldPool.end();
  await newPool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
