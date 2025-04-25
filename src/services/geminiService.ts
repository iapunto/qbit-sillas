import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any; // Puedes especificar el tipo más adelante si es necesario

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.googleApiKey as string);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateContent(prompt: string): Promise<any> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      if (!response || !response.text) {
        console.warn("Respuesta del modelo vacía o sin texto.");
        return {
          response: { text: () => "Lo siento, no obtuve una respuesta clara." },
        };
      }

      return { response };
    } catch (error: any) {
      console.error("Error al generar contenido:", error.message || error);
      // Considera lanzar el error nuevamente o manejarlo de otra manera
      // dependiendo de tus necesidades
      throw error;
    }
  }
}

export default GeminiService;
