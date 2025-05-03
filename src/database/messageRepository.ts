import { pool } from "./pgClient";

export interface Message {
  id: number;
  contact_id: number;
  direction: "inbound" | "outbound";
  message: string;
  media_url: string | null;
  created_at: Date;
}

export async function saveMessage(
  contactId: number,
  direction: "inbound" | "outbound",
  message: string,
  mediaUrl?: string
): Promise<Message> {
  const res = await pool.query(
    `INSERT INTO messages (contact_id, direction, message, media_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [contactId, direction, message, mediaUrl || null]
  );
  return res.rows[0];
}

export async function getMessagesByContact(contactId: number): Promise<Message[]> {
  const res = await pool.query(
    `SELECT * FROM messages WHERE contact_id = $1 ORDER BY created_at DESC`,
    [contactId]
  );
  return res.rows;
}

/**
 * Devuelve la conversación completa (inbound + outbound) de un contacto, ordenada por fecha ascendente.
 */
export async function getConversationByContact(contactId: number): Promise<Message[]> {
  const res = await pool.query(
    `SELECT * FROM messages WHERE contact_id = $1 ORDER BY created_at ASC`,
    [contactId]
  );
  return res.rows;
} 