// src/flows/seller.flow.ts
import { addKeyword, EVENTS } from "@builderbot/bot";
import GeminiService from "../services/geminiService";
import {
  getHistoryParse,
  handleHistory,
  clearHistory,
  saveBotMessageToDB,
} from "../utils/handledHistory";
import { logger } from "../utils/logger";
import { productList } from "~/data/products";
import { buildSellerPromptContext } from "./prompts/buildSellerPromptContext";

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutos de inactividad
const FINAL_TIMEOUT = 30 * 1000; // 30 segundos adicionales después de preguntar si está en línea

const geminiService = new GeminiService();

// Utilidad para formatear el precio en COP
const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const sellerFlow = addKeyword(EVENTS.ACTION).addAction(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    try {
      // Leer el valor anterior de lastMessageTime
      const lastMessageTime = state.get("lastMessageTime") || Date.now();
      const currentTime = Date.now();
      const askedIfOnline = state.get("askedIfOnline") || false;

      // Verificar tiempo de inactividad ANTES de actualizar lastMessageTime
      if (currentTime - lastMessageTime > IDLE_TIMEOUT && !askedIfOnline) {
        await flowDynamic("¿Aún estás en línea? 😊");
        await state.update({
          askedIfOnline: true,
          lastMessageTime: currentTime,
        });
        await handleHistory({ content: "¿Aún estás en línea? 😊", role: "assistant" }, state);
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

      // Si el usuario respondió después de inactividad, retomar la conversación sin saludar de nuevo
      if (askedIfOnline && ctx.body.trim().toLowerCase() !== "") {
        await state.update({ askedIfOnline: false }); // Reiniciar el estado
        const history = state.get("history") || [];
        const lastMessage =
          history.length > 0 ? history[history.length - 1] : null;
        await handleHistory({ content: ctx.body, role: "user" }, state);
        const flowMessages = [
          "¡Genial! Continuemos donde quedamos. 😊",
        ];
        // if (lastMessage && lastMessage.role === "user") {
        //   flowMessages.push(`Tu último mensaje fue: *${lastMessage.content}*`);
        // }
        await flowDynamic(flowMessages);
        // Actualizar el tiempo del último mensaje después de procesar
        await state.update({ lastMessageTime: currentTime });
        return;
      }

      // Procesar saludos iniciales SOLO si el historial está vacío
      if (
        /^(hola|buenos días|buenas tardes|buenas noches|buen día)$/i.test(
          ctx.body.trim()
        )
      ) {
        const history = state.get("history") || [];
        if (history.length === 0) {
          // Solo saluda si es el primer mensaje
          const saludo =
            "¡Hola! Soy SillaBot, tu asesor experto en sillas ergonómicas de Sillas.com.co. 😊 ¿Buscas una silla para tu oficina o teletrabajo? Nuestra recomendación principal es SIHOO, pero también tenemos otras opciones de gama media y alta.";
          await flowDynamic([saludo]);
          await saveBotMessageToDB(ctx.from, saludo);
          await handleHistory({ content: ctx.body, role: "user" }, state);
          // Actualizar el tiempo del último mensaje después de procesar
          await state.update({ lastMessageTime: currentTime });
          return;
        }
        // Si ya hay historial, continúa normalmente (no saluda de nuevo)
      }

      // Guardar mensaje del usuario en historial y base de datos ANTES de construir el prompt
      await handleHistory({ content: ctx.body, role: "user" }, state);

      // Construir historial para el prompt
      const historyArray = state.get("history") || [];
      // Obtener productos (puedes filtrar según lógica futura)
      const products = productList;
      // (Opcional) Obtener datos del contacto si están en el state
      const contact = state.get("contact") || {};

      // Construir el prompt usando el helper
      const prompt = buildSellerPromptContext({
        historyArray,
        userMessage: ctx.body,
        products,
        contact,
      });

      logger.debug("Prompt enviado a Gemini:", prompt);
      // Llamar a Gemini SOLO para la introducción
      const result = await geminiService.generateContent(prompt);
      const botIntro = result.response.text().trim();

      // Enviar la introducción de Gemini
      await flowDynamic(botIntro);
      await saveBotMessageToDB(ctx.from, botIntro);
      await handleHistory({ content: botIntro, role: "assistant" }, state);

      // Mostrar productos SOLO si el historial tiene más de 1 mensaje (es decir, el usuario ya respondió a las preguntas de necesidades)
      if (historyArray.length > 1) {
        // Filtrar productos relevantes según el mensaje del usuario (puedes mejorar este filtro)
        // let filteredProducts = products;
        // const userMsg = ctx.body.toLowerCase();
        // if (userMsg.includes("reposapies") || userMsg.includes("reposapiés")) {
        //   filteredProducts = products.filter(
        //     (p) =>
        //       p.description?.toLowerCase().includes("reposapies") ||
        //       p.description?.toLowerCase().includes("reposapiés")
        //   );
        // }
        // // Si no hay productos filtrados, muestra todos (o puedes mostrar un mensaje de "no hay coincidencias")
        // if (filteredProducts.length === 0) {
        //   filteredProducts = products;
        // }
        // Limitar a máximo 3 productos
        const filteredProducts = products.slice(0, 3);
        // Enviar cada producto como ficha con formato y foto
        for (const product of filteredProducts) {
          await flowDynamic([
            {
              body: `*${product.name}*\nPrecio: ${formatCOP(product.price)}\n${product.description}\n${product.link}`,
              media: product.image || undefined,
            },
          ]);
        }
      }

      // Actualizar el tiempo del último mensaje después de procesar
      await state.update({ lastMessageTime: currentTime });
    } catch (error: any) {
      logger.error("sellerFlow - Error:", error.message || error);
      await flowDynamic(
        "Lo siento, ocurrió un error al procesar tu solicitud. 😕"
      );
    }
  }
);

export default sellerFlow;
