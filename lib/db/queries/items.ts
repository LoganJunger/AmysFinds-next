import { query } from "@/lib/db/pool";

export interface InventoryItem {
  id: number;
  title: string;
  description: string | null;
  price_range: string | null;
  refinishing_tips: string | null;
  posting_details: string | null;
  condition_notes: string | null;
  key_features: string[];
  image_url: string;
  image_blob_url: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
  sold: boolean;
  sold_at: string | null;
  view_count: number;
}

export interface CreateItemInput {
  title: string;
  description?: string;
  price_range?: string;
  refinishing_tips?: string;
  posting_details?: string;
  condition_notes?: string;
  key_features?: string[];
  image_url: string;
  image_blob_url?: string;
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  price_range?: string;
  refinishing_tips?: string;
  posting_details?: string;
  condition_notes?: string;
  key_features?: string[];
  image_url?: string;
  image_blob_url?: string;
  active?: boolean;
}

export async function listActiveItems(
  search?: string,
  sort?: string
): Promise<InventoryItem[]> {
  let sql = `SELECT * FROM inventory_items WHERE active = true AND sold = false`;
  const params: unknown[] = [];

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  switch (sort) {
    case "price-asc":
      sql += ` ORDER BY price_range ASC`;
      break;
    case "price-desc":
      sql += ` ORDER BY price_range DESC`;
      break;
    case "oldest":
      sql += ` ORDER BY created_at ASC`;
      break;
    default:
      sql += ` ORDER BY created_at DESC`;
  }

  return query<InventoryItem>(sql, params);
}

export async function listAllItems(
  filter?: string,
  search?: string
): Promise<InventoryItem[]> {
  let sql = `SELECT * FROM inventory_items WHERE 1=1`;
  const params: unknown[] = [];

  if (filter === "active") {
    sql += ` AND active = true AND sold = false`;
  } else if (filter === "sold") {
    sql += ` AND sold = true`;
  } else if (filter === "inactive") {
    sql += ` AND active = false`;
  }

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  sql += ` ORDER BY created_at DESC`;
  return query<InventoryItem>(sql, params);
}

export async function getItemById(
  id: number
): Promise<InventoryItem | null> {
  const rows = await query<InventoryItem>(
    `SELECT * FROM inventory_items WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function getFeaturedItems(
  limit = 6
): Promise<InventoryItem[]> {
  return query<InventoryItem>(
    `SELECT * FROM inventory_items WHERE active = true AND sold = false ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
}

export async function createItem(
  data: CreateItemInput
): Promise<InventoryItem> {
  const rows = await query<InventoryItem>(
    `INSERT INTO inventory_items (title, description, price_range, refinishing_tips, posting_details, condition_notes, key_features, image_url, image_blob_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      data.title,
      data.description ?? null,
      data.price_range ?? null,
      data.refinishing_tips ?? null,
      data.posting_details ?? null,
      data.condition_notes ?? null,
      JSON.stringify(data.key_features ?? []),
      data.image_url,
      data.image_blob_url ?? null,
    ]
  );
  return rows[0];
}

export async function updateItem(
  id: number,
  data: UpdateItemInput
): Promise<void> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${idx++}`);
    params.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${idx++}`);
    params.push(data.description);
  }
  if (data.price_range !== undefined) {
    fields.push(`price_range = $${idx++}`);
    params.push(data.price_range);
  }
  if (data.refinishing_tips !== undefined) {
    fields.push(`refinishing_tips = $${idx++}`);
    params.push(data.refinishing_tips);
  }
  if (data.posting_details !== undefined) {
    fields.push(`posting_details = $${idx++}`);
    params.push(data.posting_details);
  }
  if (data.condition_notes !== undefined) {
    fields.push(`condition_notes = $${idx++}`);
    params.push(data.condition_notes);
  }
  if (data.key_features !== undefined) {
    fields.push(`key_features = $${idx++}`);
    params.push(JSON.stringify(data.key_features));
  }
  if (data.image_url !== undefined) {
    fields.push(`image_url = $${idx++}`);
    params.push(data.image_url);
  }
  if (data.image_blob_url !== undefined) {
    fields.push(`image_blob_url = $${idx++}`);
    params.push(data.image_blob_url);
  }
  if (data.active !== undefined) {
    fields.push(`active = $${idx++}`);
    params.push(data.active);
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = NOW()`);
  params.push(id);

  await query(
    `UPDATE inventory_items SET ${fields.join(", ")} WHERE id = $${idx}`,
    params
  );
}

export async function deleteItem(id: number): Promise<void> {
  await query(`DELETE FROM inventory_items WHERE id = $1`, [id]);
}

export async function toggleSold(id: number): Promise<boolean> {
  const rows = await query<{ sold: boolean }>(
    `UPDATE inventory_items
     SET sold = NOT sold,
         sold_at = CASE WHEN NOT sold THEN NOW() ELSE NULL END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING sold`,
    [id]
  );
  return rows[0]?.sold ?? false;
}

export async function incrementViewCount(id: number): Promise<void> {
  await query(
    `UPDATE inventory_items SET view_count = view_count + 1 WHERE id = $1`,
    [id]
  );
}

export interface DashboardStats {
  total: number;
  active: number;
  sold: number;
  today: number;
}

export async function getStats(): Promise<DashboardStats> {
  const rows = await query<{
    total: string;
    active: string;
    sold: string;
    today: string;
  }>(`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE active = true AND sold = false)::text AS active,
      COUNT(*) FILTER (WHERE sold = true)::text AS sold,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::text AS today
    FROM inventory_items
  `);
  const r = rows[0];
  return {
    total: parseInt(r.total),
    active: parseInt(r.active),
    sold: parseInt(r.sold),
    today: parseInt(r.today),
  };
}

export async function getRecentItems(limit = 5): Promise<InventoryItem[]> {
  return query<InventoryItem>(
    `SELECT * FROM inventory_items ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
}
