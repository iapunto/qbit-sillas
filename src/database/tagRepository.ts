import { pool } from "./pgClient";

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export async function getAllTags(): Promise<Tag[]> {
  const res = await pool.query("SELECT * FROM tags ORDER BY name ASC");
  return res.rows;
}

export async function getTagsByContact(contactId: number): Promise<Tag[]> {
  const res = await pool.query(
    `SELECT t.* FROM tags t
     INNER JOIN contact_tags ct ON ct.tag_id = t.id
     WHERE ct.contact_id = $1
     ORDER BY t.name ASC`,
    [contactId]
  );
  return res.rows;
}

export async function addTagToContact(contactId: number, tagId: number): Promise<void> {
  await pool.query(
    `INSERT INTO contact_tags (contact_id, tag_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [contactId, tagId]
  );
}

export async function removeTagFromContact(contactId: number, tagId: number): Promise<void> {
  await pool.query(
    `DELETE FROM contact_tags WHERE contact_id = $1 AND tag_id = $2`,
    [contactId, tagId]
  );
}

export async function createTag(name: string, color?: string): Promise<Tag> {
  const res = await pool.query(
    `INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING *`,
    [name, color || null]
  );
  return res.rows[0];
} 