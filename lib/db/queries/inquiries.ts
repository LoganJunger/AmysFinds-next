import { query } from "@/lib/db/pool";

export interface Inquiry {
  id: number;
  item_id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
  item_title?: string;
}

export async function createInquiry(data: {
  item_id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<Inquiry> {
  const rows = await query<Inquiry>(
    `INSERT INTO inquiries (item_id, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.item_id, data.name, data.email, data.phone ?? null, data.message]
  );
  return rows[0];
}

export async function listInquiries(): Promise<Inquiry[]> {
  return query<Inquiry>(
    `SELECT i.*, it.title AS item_title
     FROM inquiries i
     LEFT JOIN inventory_items it ON it.id = i.item_id
     ORDER BY i.created_at DESC`
  );
}

export async function markInquiryRead(id: number): Promise<void> {
  await query(`UPDATE inquiries SET read = true WHERE id = $1`, [id]);
}

export async function getUnreadCount(): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM inquiries WHERE read = false`
  );
  return parseInt(rows[0].count);
}
