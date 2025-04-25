import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import sellerFlow from "../flows/seller.flow";
import GeminiService from "~/services/geminiService";
import { getHistoryParse } from "../utils/handledHistory";
import { logger } from "~/utils/logger"; // Importa el logger

class IntentHandler {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  async determineIntent(message: string, state: any): Promise<string> {
    const history = getHistoryParse(state);

    const prompt = `
      Eres un asistente de IA experto en comprender las intenciones de los usuarios.
      Tu tarea es analizar el mensaje del usuario y determinar su intención principal.
      ### Historial de Conversación ###
      ${history}

      ### Mensaje del usuario: ###
      ${message}

      Posibles acciones a realizar:

      HABLAR: Esta acción se debe realizar cuando el cliente desea hacer una pregunta o necesita más información sobre IA Punto o sus servicios.
      Objetivo:

      Comprender la intención del cliente en el contexto de la conversación con IA Punto y seleccionar 
      la acción más adecuada en respuesta a su declaración.
      Consideraciones:

      * IA Punto ofrece servicios de Marketing y desarrollo web/móvil impulsadas por la Inteligencia Artificial.
      * El objetivo principal del bot es guiar al cliente, identificar sus necesidades y una vez identificada una intención o interés en un producto/servicio persuadir para que agende una reunión con un asesor.
      * El bot debe ser amigable, profesional y servicial.

      ### Instrucciones ###
        Analiza el mensaje del usuario y selecciona la acción más adecuada.
      Respuesta ideal (HABLAR):`;

    try {
      logger.debug("IntentHandler - Prompt enviado a Gemini:", prompt);

      const result = await this.geminiService.generateContent(prompt);
      let intention = result.response.text().trim();

      logger.debug("IntentHandler - Respuesta cruda de Gemini:", intention);

      // Extraer solo la primera palabra (la intención principal)
      const firstWordMatch = intention.match(/^\w+/);
      if (!firstWordMatch) {
        logger.warn(
          "IntentHandler - No se pudo extraer la intención principal del modelo."
        );
        return "UNKNOWN";
      }

      intention = firstWordMatch[0].toUpperCase();

      logger.debug("IntentHandler - Intención extraída:", intention);

      // Validar que la intención sea una de las opciones válidas
      const validIntents = ["HABLAR"];
      if (!validIntents.includes(intention)) {
        logger.warn(
          "IntentHandler - Intención no válida detectada:",
          intention
        );
        return "UNKNOWN";
      }

      return intention;
    } catch (error: any) {
      logger.error(
        "IntentHandler - Error al determinar la intención:",
        error.message || error
      );
      throw error;
    }
  }
}

const intentHandler = new IntentHandler();

export const handleIntents = async (
  ctx: BotContext,
  { gotoFlow, flowDynamic, state }: BotMethods
) => {
  try {
    // Obtener el mensaje del usuario
    const message = ctx.body;
    logger.info(`Intent Handler - Mensaje recibido: ${message}`);

    // Determinar la intención del usuario
    const intention = await intentHandler.determineIntent(message, state);
    logger.info(`Intent Handler - Intención detectada: ${intention}`);

    // Log adicional para debug
    logger.debug(
      "Intent Handler - Tipo de dato de intención:",
      typeof intention
    );
    logger.debug(
      "Intent Handler - Valor exacto de intención:",
      `"${intention}"`
    );

    logger.debug(
      `Intent Handler - Comparando: "${intention
        .trim()
        .toUpperCase()}" con "HABLAR"`
    );

    // Seleccionar la acción adecuada según la intención del usuario
    if (intention && intention.trim().toUpperCase() === "HABLAR") {
      logger.info("Intent Handler - Redirigiendo a sellerFlow");
      return gotoFlow(sellerFlow);
    } else {
      logger.warn(
        "Intent Handler - No se reconoció la intención, enviando mensaje de error"
      );
      await flowDynamic(
        "Lo siento, no pude entender tu mensaje. ¿Podrías reformularlo?"
      );
    }
  } catch (error: any) {
    logger.error("Intent Handler - Error handling intent:", error);
  }
};
