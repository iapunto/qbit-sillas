import { pool } from "./pgClient";

export interface MutedContact {
  id: number;
  contact_number: string;
  muted_at: Date;
}

export async function muteContact(contactNumber: string): Promise<MutedContact | null> {
  const res = await pool.query(
    `INSERT INTO muted_contacts (contact_number)
     VALUES ($1)
     ON CONFLICT (contact_number) DO NOTHING
     RETURNING *`,
    [contactNumber]
  );
  return res.rows[0] || null;
}

export async function unmuteContact(contactNumber: string): Promise<boolean> {
  const res = await pool.query(
    `DELETE FROM muted_contacts WHERE contact_number = $1`,
    [contactNumber]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function isContactMuted(contactNumber: string): Promise<boolean> {
  const res = await pool.query(
    `SELECT 1 FROM muted_contacts WHERE contact_number = $1`,
    [contactNumber]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function getAllMutedContacts(): Promise<MutedContact[]> {
  const res = await pool.query(`SELECT * FROM muted_contacts`);
  return res.rows;
} 