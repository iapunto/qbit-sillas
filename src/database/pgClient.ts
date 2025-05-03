import { Pool } from "pg";

export const pool = new Pool({
  user: "iapunto",
  host: "localhost",
  database: "qbit_app",
  password: "2#r36L5as+",
  port: 5436,
});
