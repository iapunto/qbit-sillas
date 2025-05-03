import { BotStateStandAlone } from "@builderbot/bot/dist/types";
import { logger } from "./logger";
import { getContactByPhone, saveContact } from "~/database/contactRepository";
import { saveMessage } from "~/database/messageRepository";

export type History = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 100;

/**
 * Guarda un mensaje outbound (del bot) en la base de datos.
 * @param phone - Número de teléfono del contacto
 * @param message - Mensaje enviado
 * @param mediaUrl - URL de media (opcional)
 */
export async function saveBotMessageToDB(phone: string, message: string, mediaUrl?: string) {
  // Buscar el contacto, si no existe lo crea vacío
  let contact = await getContactByPhone(phone);
  if (!contact) {
    contact = await saveContact(phone);
  }
  await saveMessage(contact.id, "outbound", message, mediaUrl);
  logger.debug("Mensaje outbound guardado en la base de datos para el contacto:", phone);
}

/**
 * Agrega un nuevo mensaje al historial de conversación.
 * Limita el historial a MAX_HISTORY mensajes.
 */
export const handleHistory = async (
  inside: History,
  _state: BotStateStandAlone
): Promise<void> => {
  try {
    const history = _state.get<History[]>("history") ?? [];
    history.push(inside);
    // Limitar el historial a los últimos MAX_HISTORY mensajes
    const trimmedHistory = history.slice(-MAX_HISTORY);
    await _state.update({ history: trimmedHistory });
    logger.debug("Historial actualizado:", trimmedHistory);
  } catch (error) {
    logger.error("Error al manejar el historial:", error);
    throw error;
  }
};

/**
 * Recupera los últimos k mensajes del historial de conversación.
 */
export const getHistory = (
  _state: BotStateStandAlone,
  k = 20
): History[] => {
  const history = _state.get<History[]>("history") ?? [];
  return history.slice(-k);
};

/**
 * Convierte el historial en un formato legible (cadena de texto).
 */
export const getHistoryParse = (
  _state: BotStateStandAlone,
  k = 20
): string => {
  const history = _state.get<History[]>("history") ?? [];
  const limitHistory = history.slice(-k);
  return limitHistory.reduce((prev, current) => {
    const msg =
      current.role === "user"
        ? `Customer: "${current.content}"`
        : `\nSeller: "${current.content}"\n`;
    return prev + msg;
  }, "");
};

/**
 * Limpia el historial de conversación.
 */
export const clearHistory = async (
  _state: BotStateStandAlone
): Promise<void> => {
  try {
    await _state.update({ history: [] });
    logger.info("Historial de conversación limpiado.");
  } catch (error) {
    logger.error("Error al limpiar el historial:", error);
    throw error;
  }
};
