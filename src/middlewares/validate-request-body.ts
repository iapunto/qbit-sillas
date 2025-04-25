// src/middlewares/validate-request-body.ts

import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import { logger } from "../utils/logger"; // Suponiendo que tienes un logger

const validateRequestBody = (requiredFields: string[]) => {
  return async (ctx: BotContext, methods: BotMethods, next: () => void) => {
    const { body } = ctx;

    for (const field of requiredFields) {
      if (!body || typeof body !== "object" || !(field in body)) {
        logger.warn(`Falta el campo requerido: ${field}`);
        return methods.flowDynamic(`Error: Falta el campo "${field}".`);
      }
    }

    // Si todos los campos están presentes, pasa al siguiente handler
    return next();
  };
};

export default validateRequestBody;
