import { NextResponse } from "next/server";
import { query } from "@/lib/db/pool";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check DATABASE_URL is set
  checks.database_url_set = process.env.DATABASE_URL ? "yes" : "MISSING";

  // Check DB connection
  try {
    const rows = await query<{ count: string }>(
      "SELECT COUNT(*)::text as count FROM inventory_items"
    );
    checks.database_connection = `ok (${rows[0].count} items)`;
  } catch (e) {
    checks.database_connection = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check other env vars
  checks.nextauth_secret_set = process.env.NEXTAUTH_SECRET ? "yes" : "MISSING";
  checks.openai_key_set = process.env.OPENAI_API_KEY ? "yes" : "MISSING";
  checks.blob_token_set = process.env.BLOB_READ_WRITE_TOKEN ? "yes" : "MISSING";
  checks.admin_hash_set = process.env.ADMIN_PASSWORD_HASH ? "yes" : "MISSING";

  return NextResponse.json(checks);
}
