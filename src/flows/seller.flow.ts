// src/flows/seller.flow.ts
import { addKeyword, EVENTS } from "@builderbot/bot";
import GeminiService from "../services/geminiService";
import {
  getHistoryParse,
  handleHistory,
  clearHistory,
} from "../utils/handledHistory";
import { generateTimer } from "../utils/generateTimer";
import { logger } from "../utils/logger";
import { productList } from "~/data/products";
import { filterProducts, Product } from "~/utils/productFilter";
import { sellerPrompt } from "./prompts/sellerPrompt";
import { saveBotMessageToDB } from "../utils/handledHistory";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const generatePromptSeller = (history: string, message: string) => {
  const products = JSON.stringify(productList);
  return sellerPrompt.replace("{HISTORY}", history)
    .replace("{MESSAGE}", message)
    .replace("{PRODUCTS}", products);
};

const IDLE_TIMEOUT = 60000; // 1 minuto de inactividad
const FINAL_TIMEOUT = 30000; // 30 segundos adicionales después de preguntar si está en línea

// Flujo principal del bot
const sellerFlow = addKeyword(EVENTS.ACTION).addAction(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    try {
      const lastMessageTime = state.get("lastMessageTime") || Date.now();
      const currentTime = Date.now();
      const askedIfOnline = state.get("askedIfOnline") || false;

      // Actualizar el tiempo del último mensaje
      await state.update({ lastMessageTime: currentTime });

      // Verificar tiempo de inactividad
      if (currentTime - lastMessageTime > IDLE_TIMEOUT && !askedIfOnline) {
        await flowDynamic("¿Aún estás en línea? 😊");
        await state.update({
          askedIfOnline: true,
          lastMessageTime: currentTime,
        });
        return;
      }

      // Si ya se preguntó "¿Aún estás en línea?" y no hay respuesta
      if (askedIfOnline && currentTime - lastMessageTime > FINAL_TIMEOUT) {
        await flowDynamic(
          "¡Hasta luego! Estaremos aquí cuando nos necesites. 👋"
        );
        clearHistory(state); // Limpiar el historial
        return;
      }

      // Si el usuario respondió después de inactividad, retomar la conversación
      if (askedIfOnline && ctx.body.trim().toLowerCase() !== "") {
        await state.update({ askedIfOnline: false }); // Reiniciar el estado

        // Leer el historial para retomar la conversación
        const history = state.get("history") || [];
        const lastMessage =
          history.length > 0 ? history[history.length - 1] : null;

        if (lastMessage) {
          // Enviar un mensaje contextual basado en el historial
          await flowDynamic([
            "¡Genial! Estoy aquí nuevamente. 😊",
            `Últimamente hablábamos sobre: *${lastMessage.content}*`,
            "¿Cómo quieres que sigamos buscando opciones?",
          ]);
        } else {
          // Si no hay historial, enviar un mensaje genérico
          await flowDynamic([
            "¡Genial! Estoy aquí nuevamente. 😊",
            "¿Cómo podemos seguir ayudándote?",
          ]);
        }
        return;
      }

      // Procesar saludos iniciales
      if (
        /^(hola|buenos días|buenas tardes|buenas noches)$/i.test(
          ctx.body.trim()
        )
      ) {
        await flowDynamic([
          "¡Hola! Soy SillaBot, tu asistente virtual de Sillas.com.co. 😊 ¿Buscas una silla ergonómica para mejorar tu comodidad en el trabajo o estudio?",
        ]);
        await saveBotMessageToDB(ctx.from,
          "¡Hola! Soy SillaBot, tu asistente virtual de Sillas.com.co. 😊 ¿Buscas una silla ergonómica para mejorar tu comodidad en el trabajo o estudio?",
        );
        return;
      }

      // Procesar respuestas afirmativas generales
      if (/^(sí|si|claro|por favor|ok)$/i.test(ctx.body.trim())) {
        await flowDynamic([
          "¡Genial! 😊 Para ayudarte mejor, responderé algunas preguntas rápidas. ¿Cuál es el uso principal que le darás a la silla?",
          "1️⃣ Trabajo desde casa o en oficina (uso diario)",
          "2️⃣ Uso ocasional o para espacios compartidos",
          "3️⃣ Gaming o actividades intensivas",
          "4️⃣ No estoy seguro/a",
        ]);
        await state.update({ step: "usage" }); // Guardar el estado actual del flujo
        return;
      }

      // Manejar las respuestas del usuario en el proceso interactivo
      const currentStep = state.get("step");

      if (currentStep === "usage") {
        const usageResponse = ctx.body.trim();
        let filteredProducts: Product[] = [];

        if (/^(1|trabajo|oficina)$/i.test(usageResponse)) {
          filteredProducts = filterProducts(productList, { minPrice: 2000000 }); // Gama alta
        } else if (
          /^(2|uso ocasional|espacios compartidos)$/i.test(usageResponse)
        ) {
          filteredProducts = filterProducts(productList, { maxPrice: 1000000 }); // Gama media
        } else if (/^(3|gaming|intensivas)$/i.test(usageResponse)) {
          filteredProducts = filterProducts(productList, { minPrice: 2500000 }); // Gama alta especializada
        } else {
          await flowDynamic("Entendido. Sigamos explorando opciones. 😊");
        }

        // Mostrar los productos filtrados
        if (filteredProducts.length > 0) {
          for (const product of filteredProducts) {
            const formattedMessage = `
              *${product.name}*
              Precio: ${formatCOP(product.price)}
              Descripción: ${product.description || "Sin descripción"}
              Link: ${product.link || "No disponible"}
            `;
            await flowDynamic([
              {
                body: formattedMessage,
                media: product.image || undefined,
              },
            ]);
            logger.info(
              "sellerFlow - Mensaje enviado al usuario:",
              formattedMessage
            );
          }
        } else {
          await flowDynamic(
            "No encontré productos que coincidan con tu búsqueda. 😕 ¿Te gustaría ver otras opciones?"
          );
        }

        // Actualizar el estado para avanzar al siguiente paso
        await state.update({ step: "next_step" });
        return;
      }

      // Procesar respuestas negativas o incompletas
      if (/^(no|nop|no gracias)$/i.test(ctx.body.trim())) {
        await flowDynamic(
          "Entendido. Si cambias de opinión, aquí estaré para ayudarte. 😊"
        );
        return;
      }

      // Si no se entiende la respuesta, pedir clarificación
      await flowDynamic(
        "No entendí tu respuesta. 😕 ¿Podrías elegir una de las opciones anteriores?"
      );

      // Guardar el historial
      await handleHistory({ content: ctx.body, role: "user" }, state);
    } catch (error: any) {
      logger.error("sellerFlow - Error:", error.message || error);
      await flowDynamic(
        "Lo siento, ocurrió un error al procesar tu solicitud. 😕"
      );
    }
  }
);

/**
 * Formatea la respuesta para que cada producto tenga un formato claro y único.
 */
function formatProductResponse(products: Product[]) {
  if (!Array.isArray(products) || products.length === 0) {
    return [
      {
        body: "No encontré productos que coincidan con tu búsqueda. 😕 ¿Te gustaría ver otras opciones?",
      },
    ];
  }

  return products.map((product) => ({
    body: `
*${product.name}*
Precio: ${formatCOP(product.price)}
Descripción: ${product.description || "Sin descripción"}
Link: ${product.link || "No disponible"}
`,
    media: product.image || undefined,
  }));
}

export default sellerFlow;
