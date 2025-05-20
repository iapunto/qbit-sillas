import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "qbit_app",
  password: "23r36L5as",
  port: 5436,
});
