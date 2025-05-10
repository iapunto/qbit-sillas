import { pool } from "./pgClient";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "agent" | "viewer";
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  const { name, email, password_hash, role, avatar_url } = user;
  const res = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, avatar_url)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, email, password_hash, role, avatar_url || null]
  );
  return res.rows[0];
}

export async function updateUser(id: number, fields: Partial<User>): Promise<User> {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const res = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return res.rows[0];
}

export async function deleteUser(id: number): Promise<void> {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}

export async function getAllUsers(): Promise<User[]> {
  const res = await pool.query("SELECT * FROM users ORDER BY name ASC");
  return res.rows;
}
