import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import { handleHistory } from "../utils/handledHistory";
import { logger } from "../utils/logger"; // Importa el logger

/**
 * Almacena todos los mensajes del usuario en el `state`.
 *
 * @param ctx - Contexto del bot, incluyendo el mensaje del usuario.
 * @param methods - Métodos del bot, como `state`.
 */
export default async (
  ctx: BotContext,
  { state }: BotMethods
): Promise<void> => {
  const { body } = ctx;
  try {
    // Valida que el mensaje no esté vacío
    if (!body || body.trim().length === 0) {
      logger.warn(
        "El mensaje del usuario está vacío o contiene solo espacios en blanco."
      );
      return;
    }

    // Almacena el mensaje en el historial
    await handleHistory({ content: body.trim(), role: "user" }, state);
    logger.debug("Mensaje guardado en el historial:", body.trim()); // Log para verificar el almacenamiento
  } catch (error) {
    logger.error("Error en conversationalLayer:", error);
    throw error; // Propaga el error para manejarlo en niveles superiores si es necesario
  }
};
