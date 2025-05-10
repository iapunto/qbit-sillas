import { pool } from "./pgClient";

export interface Company {
  id: number;
  name: string;
  logo_url?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  created_at: Date;
  updated_at: Date;
}

export async function getCompany(): Promise<Company | null> {
  const res = await pool.query("SELECT * FROM company LIMIT 1");
  return res.rows[0] || null;
}

export async function updateCompany(fields: Partial<Company>): Promise<Company> {
  // Construye el query dinámicamente según los campos enviados
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const res = await pool.query(
    `UPDATE company SET ${setClause}, updated_at = NOW() WHERE id = 1 RETURNING *`,
    values
  );
  return res.rows[0];
}
