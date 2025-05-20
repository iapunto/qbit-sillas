// src/flows/seller.flow.ts
import { addKeyword, EVENTS } from "@builderbot/bot";
import GeminiService from "../services/geminiService";
import { getAllUsers } from "../database/userRepository";
import { calculateDistance } from "../utils/calculateDistance";
import {
  getHistoryParse,
  handleHistory,
  clearHistory,
  saveBotMessageToDB,
} from "../utils/handledHistory";
import { logger } from "../utils/logger";
import { productList } from "~/data/products";
import { buildSellerPromptContext } from "./prompts/buildSellerPromptContext";

// Definición de tipo para un producto (idealmente importada desde un archivo compartido)
interface Product {
  name: string;
  price: number;
  description?: string;
  link?: string;
  image?: string;
  brand?: string;
}

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

// Función para buscar productos relevantes en el texto
const findRelevantProductsInText = (
  text: string,
  allProducts: Product[]
): Product[] => {
  const lowerCaseText = text.toLowerCase();
  const relevant: Product[] = [];

  // Ordenar productos por longitud del nombre (descendente) para encontrar coincidencias más específicas primero
  const sortedProducts = [...allProducts].sort(
    (a, b) => b.name.length - a.name.length
  );

  for (const product of sortedProducts) {
    const lowerCaseProductName = product.name.toLowerCase();

    // Buscar coincidencias exactas o cercanas del nombre completo del producto
    // Usamos expresiones regulares para ser más flexibles con espacios o puntuación
    const escapedProductName = lowerCaseProductName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(`\\b${escapedProductName}\\b`, "i"); // \\b para buscar límites de palabra

    if (regex.test(lowerCaseText)) {
      // Evitar duplicados si un producto coincide con múltiples frases
      if (!relevant.some((p) => p.name === product.name)) {
        relevant.push(product);
      }
    } else if (
      product.brand &&
      lowerCaseText.includes(product.brand.toLowerCase())
    ) {
      // Fallback: si no coincide el nombre completo, buscar solo la marca,
      // pero solo si el nombre del producto es relativamente corto (evita falsos positivos con "Sihoo")
      const simpleProductName = lowerCaseProductName
        .replace(/silla ergonómica/g, "")
        .trim();
      if (
        lowerCaseText.includes(simpleProductName) &&
        !relevant.some((p) => p.name === product.name)
      ) {
        relevant.push(product);
      }
    }
  }

  // Si se encontraron productos, intentar refinar por color si se menciona un color en el texto y hay variantes del mismo producto
  if (
    relevant.length > 1 &&
    (lowerCaseText.includes("negra") || lowerCaseText.includes("gris"))
  ) {
    const color = lowerCaseText.includes("negra") ? "negra" : "gris";
    const colorFiltered = relevant.filter((p) =>
      p.name.toLowerCase().includes(color)
    );
    if (colorFiltered.length > 0) {
      logger.debug(`Refined product list by color: ${color}`);
      return colorFiltered;
    }
  }

  // Limitar el número de resultados si encontramos muchos
  return relevant.slice(0, 5);
};

// Función para mostrar la lista de productos
const showProducts = async (
  flowDynamic: any,
  allProducts: Product[],
  textContext: string
) => {
  let productsToShow: Product[] = [];

  // Intentar encontrar productos relevantes basándose en el texto (respuesta del bot + mensaje del usuario)
  // Damos más peso a la respuesta del bot, luego al mensaje del usuario
  const combinedText = textContext; // botResponseText + userMessageText; // Podríamos combinar o buscar por separado
  productsToShow = findRelevantProductsInText(combinedText, allProducts);

  // Si no se encontraron productos específicos, mostrar las 3-5 sillas SIHOO principales como fallback
  if (productsToShow.length === 0) {
    logger.debug(
      "showProducts - No specific products found, falling back to main SIHOO products."
    );
    productsToShow = allProducts
      .filter((p: Product) => p.brand === "SIHOO")
      .slice(0, 5);
  }

  // Limitar a máximo 5 productos para no abrumar (aunque findRelevantProductsInText ya lo hace)
  productsToShow = productsToShow.slice(0, 5);

  if (productsToShow.length === 0) {
    logger.warn("showProducts - No relevant products found to display.");
    return; // Do not send any product cards if the list is empty
  }

  // Enviar cada producto como ficha con formato y foto
  logger.info(`showProducts - Sending ${productsToShow.length} product cards.`);
  for (const product of productsToShow) {
    await flowDynamic([
      {
        body: `*${product.name}*\nMarca: ${
          product.brand || "SIHOO"
        }\nPrecio: ${formatCOP(product.price)}\n${product.description || ""}\n${
          product.link || ""
        }`,
        media: product.image || undefined,
      },
    ]);
  }
};

const sellerFlow = addKeyword(EVENTS.ACTION).addAction(
  async (ctx, { state, flowDynamic, gotoFlow }) => {
    try {
      // Leer el valor anterior de lastMessageTime
      const lastMessageTime = state.get("lastMessageTime") || Date.now();
      const currentTime = Date.now();
      const askedIfOnline = state.get("askedIfOnline") || false;
      const currentIntent = state.get("currentIntent"); // Get the intent from state
      const message = ctx.body; // User's current message

      // --- Timeout and Agent Handoff Check (Concept) ---
      // Add agent handoff check here
      if (message.toLowerCase().includes("hablar con un agente")) {
        await flowDynamic(
          "Por favor, comparte tu ubicación para que podamos contactar al agente más cercano."
        );
        await state.update({ requestingLocation: true });
        return;
      }
      if (state.get("requestingLocation")) {
        if (ctx?.message?.location) {
          const { latitude, longitude } = ctx.message.location;
          logger.info(`Ubicación del cliente: ${latitude}, ${longitude}`);
          await flowDynamic(
            "Gracias por compartir tu ubicación. Estamos buscando un agente cercano..."
          );
          await state.update({ requestingLocation: false });
          // Aquí iría la lógica para encontrar y notificar al agente más cercano
          // 1. Obtener todos los agentes
          const allUsers = await getAllUsers();
          const agents = allUsers.filter((user: any) => user.role === "agent");

          // 2. Calcular la distancia a cada agente
          const distances = agents.map((agent) => {
            const agentLatitude = agent.latitude || 0;
            const agentLongitude = agent.longitude || 0;
            const distance = calculateDistance(
              latitude,
              longitude,
              agentLatitude,
              agentLongitude
            );
            return { agent, distance };
          });

          // 3. Encontrar el agente más cercano
          const closestAgent = distances.reduce((prev: any, curr: any) =>
            prev.distance < curr.distance ? prev : curr
          ).agent;

          // 4. Notificar al agente
          await flowDynamic(
            `Se ha notificado al agente ${closestAgent.name} para que se ponga en contacto contigo.`
          );

          // Aquí iría la lógica para enviar un mensaje al agente
          // usando el provider para enviar un mensaje al agente

          return;
        } else {
          await flowDynamic(
            "Por favor, comparte tu ubicación para que podamos contactar al agente más cercano."
          );
          return;
        }
      }
      // if (state.get('paused')) { ... }
      // --- End Timeout and Agent Handoff Check ---

      // Verificar tiempo de inactividad ANTES de actualizar lastMessageTime
      if (currentTime - lastMessageTime > IDLE_TIMEOUT && !askedIfOnline) {
        await flowDynamic("¿Aún estás en línea? 😊");
        await state.update({
          askedIfOnline: true,
          lastMessageTime: currentTime,
          currentIntent: null, // Clear intent on timeout ask
        });
        await handleHistory(
          { content: "¿Aún estás en línea? 😊", role: "assistant" },
          state
        );
        return;
      }

      // Si ya se preguntó "¿Aún estás en línea?" y no hay respuesta
      if (askedIfOnline && currentTime - lastMessageTime > FINAL_TIMEOUT) {
        await flowDynamic(
          "¡Hasta luego! Estaremos aquí cuando nos necesites. 👋"
        );
        clearHistory(state); // Limpiar el historial
        await state.update({
          currentIntent: null,
          askedIfOnline: false,
          lastMessageTime: null,
        }); // Clear all relevant state
        return;
      }

      // Si el usuario respondió después de inactividad, retomar la conversación
      if (askedIfOnline && message.trim().toLowerCase() !== "") {
        await state.update({ askedIfOnline: false }); // Reiniciar el estado
        await handleHistory({ content: message, role: "user" }, state); // Save user response
        await state.update({ lastMessageTime: currentTime });
        // Continue processing the message below
      } else if (!askedIfOnline) {
        // Only handle new messages if not in timeout recovery
        // Guardar mensaje del usuario en historial y base de datos
        await handleHistory({ content: message, role: "user" }, state);
      }

      // Construir historial para el prompt (includes the latest user message if saved above)
      const historyArray = state.get("history") || [];
      // Obtener productos
      const products: Product[] = productList as Product[]; // Aseguramos el tipo
      // Obtener datos del contacto si están en el state
      const contact = state.get("contact") || {};

      // Construir el prompt, pasando la intención actual
      const prompt = buildSellerPromptContext({
        historyArray,
        userMessage: message,
        products,
        contact,
        currentIntent, // Pass the detected intent
      });

      logger.debug(
        `Prompt enviado a Gemini (${currentIntent || "HABLAR"}):`,
        prompt
      );
      const result = await geminiService.generateContent(prompt);
      let botResponse = result.response.text().trim(); // Use let
      const originalBotResponseText = result.response.text().trim(); // Keep original for filtering

      // --- Check for Product Display Marker ---
      const showProductMarker = "<SHOW_PRODUCT_NOW>";
      const shouldShowProducts = botResponse.includes(showProductMarker);

      if (shouldShowProducts) {
        // Remove the marker from the response text that will be sent as a message
        botResponse = botResponse.replace(showProductMarker, "").trim();
        logger.info(
          "sellerFlow - Marker detected. Preparing to show products."
        );
      }
      // --- End Check for Marker ---

      // Send the text response from Gemini (without the marker if present)
      if (botResponse) {
        // Only send if there's text left
        await flowDynamic(botResponse);
        await saveBotMessageToDB(ctx.from, botResponse);
        // Only save bot's text response to history, not the marker
        await handleHistory({ content: botResponse, role: "assistant" }, state);
      } else if (shouldShowProducts) {
        // If Gemini's response was ONLY the marker, send a default message
        const defaultMsg =
          currentIntent === "VENDER"
            ? "Claro, te muestro la información:"
            : "Según tus necesidades, te recomiendo esta opción:";
        await flowDynamic(defaultMsg);
        await saveBotMessageToDB(ctx.from, defaultMsg);
        await handleHistory({ content: defaultMsg, role: "assistant" }, state);
      }

      // If the marker was detected, show the product cards AFTER the text response
      if (shouldShowProducts) {
        // Pass all products and the combined bot's ORIGINAL response text + user message to filtering logic
        // Passing originalBotResponseText + message gives more context for findRelevantProductsInText
        await showProducts(
          flowDynamic,
          products,
          originalBotResponseText + " " + message
        );
      }

      // Actualizar el tiempo del último mensaje después de procesar
      await state.update({ lastMessageTime: currentTime });
      // Clear intent after processing the turn
      await state.update({ currentIntent: null });
    } catch (error: any) {
      logger.error("sellerFlow - Error:", error.message || error);
      await flowDynamic(
        "Lo siento, ocurrió un error al procesar tu solicitud. 😕"
      );
      await state.update({ currentIntent: null }); // Clear intent on error
    }
  }
);

export default sellerFlow;
