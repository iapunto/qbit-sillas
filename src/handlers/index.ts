import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import sellerFlow from "../flows/seller.flow";
import GeminiService from "~/services/geminiService";
import { getHistoryParse } from "../utils/handledHistory";
import { logger } from "~/utils/logger";
import { intentPrompt } from "./prompts/intentPrompt";

class IntentHandler {
  private geminiService: GeminiService;

  constructor() {
    this.geminiService = new GeminiService();
  }

  /**
   * Determina la intención del usuario usando IA
   */
  async determineIntent(message: string, state: any): Promise<string> {
    const history = getHistoryParse(state);
    const prompt = intentPrompt
      .replace("{HISTORY}", history)
      .replace("{MESSAGE}", message);

    try {
      logger.debug("IntentHandler - Prompt enviado a Gemini:", prompt);
      const result = await this.geminiService.generateContent(prompt);
      let intention = result.response.text().trim();
      // Extraer solo la primera palabra (la intención principal)
      const firstWordMatch = intention.match(/^\w+/);
      if (!firstWordMatch) {
        logger.warn("IntentHandler - No se pudo extraer la intención principal del modelo.");
        return "UNKNOWN";
      }
      intention = firstWordMatch[0].toUpperCase();
      // Validar que la intención sea una de las opciones válidas
      const validIntents = ["HABLAR"];
      if (!validIntents.includes(intention)) {
        logger.warn("IntentHandler - Intención no válida detectada:", intention);
        return "UNKNOWN";
      }
      return intention;
    } catch (error: any) {
      logger.error("IntentHandler - Error al determinar la intención:", error.message || error);
      throw error;
    }
  }
}

const intentHandler = new IntentHandler();

/**
 * Handler principal para gestionar la intención del usuario y redirigir el flujo
 */
export const handleIntents = async (
  ctx: BotContext,
  { gotoFlow, flowDynamic, state }: BotMethods
) => {
  try {
    const message = ctx.body;
    logger.info(`Intent Handler - Mensaje recibido: ${message}`);
    const intention = await intentHandler.determineIntent(message, state);
    logger.info(`Intent Handler - Intención detectada: ${intention}`);
    if (intention && intention.trim().toUpperCase() === "HABLAR") {
      logger.info("Intent Handler - Redirigiendo a sellerFlow");
      return gotoFlow(sellerFlow);
    } else {
      logger.warn("Intent Handler - No se reconoció la intención, enviando mensaje de error");
      await flowDynamic("Lo siento, solo puedo ayudarte con información sobre sillas ergonómicas de gama media y alta de las marca SIHOO o las que tenemos disponibles. ¿Te gustaría conocer nuestros productos?");
    }
  } catch (error: any) {
    logger.error("Intent Handler - Error handling intent:", error);
  }
};
