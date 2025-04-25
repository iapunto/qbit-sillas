import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import { handleHistory } from "../utils/handledHistory";

/**
 * Almacena en el estado (`state`) todos los mensajes escritos por el usuario.
 * @param ctx - Contexto del bot, que incluye el mensaje del usuario.
 * @param methods - Métodos del bot, como el estado (`state`).
 */
export default async (
  ctx: BotContext,
  { state }: BotMethods
): Promise<void> => {
  const { body } = ctx;

  // Validar que el mensaje no esté vacío
  if (!body || body.trim().length === 0) {
    console.warn(
      "El mensaje del usuario está vacío o contiene solo espacios en blanco."
    );
    return;
  }

  // Almacenar el mensaje en el historial
  await handleHistory({ content: body.trim(), role: "user" }, state);
};
