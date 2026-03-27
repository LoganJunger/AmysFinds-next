import { neon } from "@neondatabase/serverless";

function getSql() {
  return neon(process.env.DATABASE_URL!);
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const sql = getSql();
  // Use the .query() method for parameterized queries with $1, $2, etc.
  const rows = await sql.query(text, params ?? []);
  return rows as T[];
}

export { getSql as sql };
