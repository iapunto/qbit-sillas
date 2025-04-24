// src/config.ts

import dotenv from "dotenv";

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Lista de variables requeridas
const requiredEnvVars = [
  "JWT_TOKEN",
  "NUMBER_ID",
  "VERIFY_TOKEN",
  "VERSION",
  "GOOGLE_API_KEY",
  "PORT",
];

// Validar que todas las variables requeridas estén definidas
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`La variable de entorno ${varName} no está definida.`);
  }
}

// Exportar las variables de entorno como constantes
export const config = {
  jwtToken: process.env.JWT_TOKEN!,
  numberId: process.env.NUMBER_ID!,
  verifyToken: process.env.VERIFY_TOKEN!,
  version: process.env.VERSION!,
  googleApiKey: process.env.GOOGLE_API_KEY!,
  port: parseInt(process.env.PORT!, 10),
};
