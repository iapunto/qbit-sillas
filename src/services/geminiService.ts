import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "~/config";
import { logger } from "~/utils/logger"; // Importa el logger

/**
 * Servicio para interactuar con Google Gemini
 */
export interface GeminiResponse {
  response: any; // Puedes tipar mejor si conoces la estructura
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string = "gemini-2.5-flash-preview-04-17";

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.googleApiKey);
  }

  /**
   * Genera contenido usando Gemini
   * @param prompt - El prompt a enviar
   * @param model - (Opcional) Modelo a usar
   */
  async generateContent(prompt: string, model?: string): Promise<GeminiResponse> {
    try {
      logger.debug("GeminiService - Prompt:", prompt);
      const modelName = model || this.defaultModel;
      const generativeModel: GenerativeModel = this.genAI.getGenerativeModel({
        model: modelName,
      });
      logger.debug("GeminiService - Modelo usado:", modelName);
      const result = await generativeModel.generateContent(prompt);
      logger.debug("GeminiService - Respuesta recibida");
      return result;
    } catch (error: any) {
      logger.error(
        "GeminiService - Error al generar contenido con Gemini:",
        error.message || error
      );
      logger.error("GeminiService - Error detallado:", error); // Log the full error object
      throw error;
    }
  }
}

export default GeminiService;
