import { pool } from "./pgClient";

export interface Contact {
  id: number;
  phone_number: string;
  name: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function saveContact(phone: string, name?: string): Promise<Contact> {
  const res = await pool.query(
    `INSERT INTO contacts (phone_number, name)
     VALUES ($1, $2)
     ON CONFLICT (phone_number) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [phone, name || null]
  );
  return res.rows[0];
}

export async function getContactByPhone(phone: string): Promise<Contact | null> {
  const res = await pool.query(
    `SELECT * FROM contacts WHERE phone_number = $1`,
    [phone]
  );
  return res.rows[0] || null;
}

export async function getAllContacts() {
  const res = await pool.query(`
    SELECT c.*, 
      COALESCE(MAX(m.created_at), c.updated_at) AS last_activity
    FROM contacts c
    LEFT JOIN messages m ON m.contact_id = c.id
    GROUP BY c.id
    ORDER BY last_activity DESC
  `);
  return res.rows;
} 