// src/config/index.ts

import dotenv from "dotenv";
import { logger } from "~/utils/logger";

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
    logger.error(`La variable de entorno ${varName} no está definida.`);
    throw new Error(`La variable de entorno ${varName} no está definida.`);
  }
}

/**
 * Tipado estricto para la configuración global
 */
export interface Config {
  jwtToken: string;
  numberId: string;
  verifyToken: string;
  version: string;
  googleApiKey: string;
  port: number;
  // Agrega aquí variables opcionales si las necesitas en el futuro
}

/**
 * Configuración global de la aplicación
 */
export const config: Config = {
  jwtToken: process.env.JWT_TOKEN!,
  numberId: process.env.NUMBER_ID!,
  verifyToken: process.env.VERIFY_TOKEN!,
  version: process.env.VERSION!,
  googleApiKey: process.env.GOOGLE_API_KEY!,
  port: parseInt(process.env.PORT!, 10),
};
