import { Product } from "~/data/products";
import { sellerPrompt } from "./sellerPrompt";


/**
 * Construye el prompt final para Gemini usando el historial, mensaje, productos y datos del contacto.
 * @param {string[]} historyArray - Historial de mensajes (array de objetos o strings)
 * @param {string} userMessage - Mensaje actual del usuario
 * @param {any[]} products - Lista de productos disponibles (SIHOO y otras marcas)
 * @param {object} [contact] - Datos del contacto (opcional)
 * @returns {string} Prompt listo para enviar a Gemini
 */
export function buildSellerPromptContext({
  historyArray,
  userMessage,
  products,
  contact = {},
  currentIntent,
}: {
  historyArray: Array<{ role: string; content: string }>;
  userMessage: string;
  products: Product[];
  contact?: Record<string, any>;
  currentIntent?: string;
}): string {
  // Formatea el historial como texto para el prompt
  const historyText = historyArray
    .map((msg) => `${msg.role === "user" ? "Usuario" : "SillaBot"}: ${msg.content}`)
    .join("\n");

  // Serializa la lista de productos SIHOO (y otras marcas si aplica)
  const productsText = products
    .map(
      (p) =>
        `Nombre: ${p.name}\nMarca: ${p.brand || "SIHOO"}\nPrecio: ${p.price}\nDescripción: ${p.description || ""}\nLink: ${p.link || ""}`
    )
    .join("\n---\n");

  // (Opcional) Añade datos del contacto si se desea personalizar más el prompt
  let contactText = "";
  if (contact && Object.keys(contact).length > 0) {
    contactText = `\n\n### Datos del Usuario ###\n${Object.entries(contact)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")}`;
  }

  // Construye el prompt final usando el sellerPrompt
  return sellerPrompt
    .replace("{HISTORY}", historyText)
    .replace("{MESSAGE}", userMessage)
    .replace("{PRODUCTS}", productsText)
    .replace("{CONTACT_INFO}", contactText)
    .replace("{INTENT}", currentIntent || 'HABLAR');
} 