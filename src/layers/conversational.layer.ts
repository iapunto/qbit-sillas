import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import { handleHistory } from "../utils/handledHistory";
import { logger } from "../utils/logger"; // Importa el logger
import { saveContact, getContactByPhone } from "~/database/contactRepository";
import { saveMessage } from "~/database/messageRepository";
import { isContactMuted } from "~/database/mutedContactRepository";

/**
 * Almacena todos los mensajes del usuario en el `state` y en la base de datos.
 *
 * @param ctx - Contexto del bot, incluyendo el mensaje del usuario.
 * @param methods - Métodos del bot, como `state`.
 */
export default async (
  ctx: BotContext,
  { state }: BotMethods
): Promise<void> => {
  const { body, from, senderName } = ctx;
  try {
    // Valida que el mensaje no esté vacío
    if (!body || body.trim().length === 0) {
      logger.warn(
        "El mensaje del usuario está vacío o contiene solo espacios en blanco."
      );
      return;
    }

    // Guardar o actualizar el contacto en la base de datos
    const contact = await saveContact(from, senderName);
    logger.debug("Contacto guardado/obtenido:", contact);

    // Guardar el mensaje recibido en la base de datos
    await saveMessage(contact.id, "inbound", body.trim());
    logger.debug("Mensaje guardado en la base de datos para el contacto:", from);

    // Verificar si el contacto está muteado
    const muted = await isContactMuted(from);
    if (muted) {
      logger.info(`El contacto ${from} está muteado. El bot no responderá.`);
      // Opcional: podrías guardar en el historial si lo deseas
      await handleHistory({ content: body.trim(), role: "user" }, state);
      return;
    }

    // Almacena el mensaje en el historial (memoria del bot)
    await handleHistory({ content: body.trim(), role: "user" }, state);
    logger.debug("Mensaje guardado en el historial:", body.trim());
  } catch (error) {
    logger.error("Error en conversationalLayer:", error);
    throw error; // Propaga el error para manejarlo en niveles superiores si es necesario
  }
};
