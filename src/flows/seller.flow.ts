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

const PROMPT_SELLER = `
    Instrucciones para el BOT :
    Nombre del BOT : SillaBot 🪑
    Rol : Asistente virtual especializado en ventas y soporte para Sillas.com.co.

    Reglas de Respuesta :
    Saludo Inicial :
    Si el usuario inicia con "hola", "buenos días", etc., responde:
    "¡Hola! Soy SillaBot, tu asistente virtual de Sillas.com.co. 😊 ¿Buscas una silla ergonómica para mejorar tu comodidad en el trabajo o estudio?" 
    .
    Mensajes Repetidos o Sin Claridad :
    Si el usuario repite saludos o mensajes vagos, responde:
    "¿Te gustaría conocer nuestras sillas ergonómicas más vendidas, como la Sihoo Doro S300 o la Ergomax M97B? ¡Son ideales para cuidar tu postura! 🛋️" 
    .
    Interacciones Prolongadas Sin Intención Clara :
    Si tras 5+ mensajes no hay claridad, pregunta:
    "¡Hola de nuevo! 😊 ¿Necesitas ayuda para elegir una silla, consultar promociones o ver modelos específicos?" 
    .
    Consultas Sobre Productos :
    Si el usuario menciona un modelo (ej.: "Sihoo Doro S300"), responde con detalles del JSON:
    "La Sihoo Doro S300 en color negro tiene un precio especial de $3.465.000 COP. ¡Aprovecha la preventa hasta abril 2025! 🛒 [Link] " 
    .
    Promociones o Ofertas :
    Si el usuario pregunta por descuentos, menciona:
    "¡La Sihoo Doro S300 está en preventa con 10% OFF! Versión gris: 3.550.000COP.Reservacon1.000.000 COP. 🎉 [Link] " 
    .
    Agendar Contacto o Compras :
    Si el usuario muestra interés en comprar, redirige:
    "¡Genial! Visita nuestro catálogo: sillas.com.co/tienda o escríbenos a Instagram (@sillas.com.co) para asesoría. 📲".

    Respuesta Fuera de Horario :
    Fuera de 9:00–17:00 (lunes–viernes):
    "¡Hola! Nuestro equipo te atenderá en horario laboral. Déjanos un mensaje y te contactaremos. ⏰"

    Preguntas Fuera de Alcance :
    Si el usuario pregunta algo no relacionado:
    "Lo siento, no entiendo tu consulta. 😕 ¿Te refieres a nuestras sillas ergonómicas o promociones?"

    Información de Sillas.com.co :
    Quiénes Somos :
    Especialistas en sillas ergonómicas para oficina y estudio.

    Modelos destacados:
    Sihoo Doro S300 : Reclinación antigravedad y soporte lumbar.
    Ergomax M97B : Ajustes de altura y reposabrazos 4D.

    Promociones Vigentes :
    Preventa Sihoo Doro S300 : Hasta el 30/04/2025 con 10% OFF.

    Lista de Productos Disponibles :
    {PRODUCTS}

    Contacto :
    Instagram: @sillas.com.co (11K seguidores).
    Sitio web: sillas.com.co .
    WhatsApp: +57 316 376 9935 (ejemplo).
    Historial de Conversación :
    {HISTORY}

    Mensaje del Usuario :
    {MESSAGE}

    Formato de Respuesta :
    Lenguaje amigable, emojis relacionados (🪑, 🛒, 🎉).
    Prioridad a redirigir a ventas o contacto directo.
    `;

const generatePromptSeller = (history: string, message: string) => {
  const products = JSON.stringify(productList);
  return PROMPT_SELLER.replace("{HISTORY}", history)
    .replace("{MESSAGE}", message)
    .replace("{PRODUCTS}", products);
};

const IDLE_TIMEOUT = 60000; // 1 minuto de inactividad
const FINAL_TIMEOUT = 30000; // 30 segundos adicionales después de preguntar si está en línea

const emptyFlow = addKeyword("EMPTY_FLOW").addAction(() => {});

const sellerFlow = addKeyword(EVENTS.ACTION).addAction(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    try {
      const lastMessageTime = state.get("lastMessageTime") || Date.now();
      const currentTime = Date.now();
      const askedIfOnline = state.get("askedIfOnline") || false;

      // Verificar tiempo de inactividad
      if (currentTime - lastMessageTime > IDLE_TIMEOUT && !askedIfOnline) {
        await flowDynamic("¿Aún estás en línea? 😊");
        state.update({ askedIfOnline: true, lastMessageTime: currentTime }); // Marcar que se hizo la pregunta
        return;
      }

      // Si ya se preguntó "¿Aún estás en línea?" y no hay respuesta
      if (askedIfOnline && currentTime - lastMessageTime > FINAL_TIMEOUT) {
        await flowDynamic(
          "¡Hasta luego! Estaremos aquí cuando nos necesites. 👋"
        );
        clearHistory(state); // Limpiar el historial
        gotoFlow(emptyFlow); // Finalizar el flujo
        return;
      }

      // Actualizar el tiempo del último mensaje
      state.update({ lastMessageTime: currentTime });

      logger.info("sellerFlow - Recibido mensaje del usuario:", ctx.body);
      const geminiServices = new GeminiService();
      const history = getHistoryParse(state);

      logger.debug("sellerFlow - Historial de conversación:", history);

      const prompt = generatePromptSeller(history, ctx.body);
      logger.debug("sellerFlow - Prompt generado:", prompt);

      const result = await geminiServices.generateContent(prompt);
      let response = result.response.text();
      logger.debug("sellerFlow - Respuesta del modelo:", response);

      // Reemplazar placeholders de enlaces usando la lista de productos
      productList.forEach((product) => {
        const placeholder = `[Link a la ${product.name.split(" - ")[0]}]`;
        response = response.replace(placeholder, product.link);
      });

      // Evitar respuestas repetitivas
      const lastBotMessage = state.get("lastBotMessage");
      if (lastBotMessage === response) {
        await flowDynamic(
          "¡Gracias por contactarnos! Si tienes más preguntas, no dudes en escribirnos. 😊"
        );
        clearHistory(state); // Limpiar el historial
        gotoFlow(emptyFlow); // Finalizar el flujo
        return;
      }

      // Guardar el último mensaje enviado por el bot
      state.update({ lastBotMessage: response });

      await handleHistory({ content: response, role: "assistant" }, state);
      logger.debug("sellerFlow - Historial actualizado.");

      const chunks = response.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        await flowDynamic([
          { body: chunk.trim(), delay: generateTimer(2000, 3500) },
        ]);
        logger.info("sellerFlow - Mensaje enviado al usuario:", chunk.trim());
      }
    } catch (error: any) {
      logger.error("sellerFlow - Error:", error.message || error);
      await flowDynamic(
        "Lo siento, no puedo generar una respuesta en este momento. 😕"
      );
    }
  }
);

export default sellerFlow;
