import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "~/config";
import { logger } from "~/utils/logger"; // Importa el logger

class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.googleApiKey);
  }

  async generateContent(prompt: string): Promise<any> {
    try {
      logger.debug("GeminiService - Prompt:", prompt); // Log the prompt

      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      logger.debug("GeminiService - Modelo:", model); // Log the model object

      const result = await model.generateContent(prompt);
      logger.debug("GeminiService - Resultado:", result); // Log the raw result

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
