import GeminiService from "~/services/geminiService";
import { getHistoryParse } from "~/utils/handledHistory";

class MainLayer {
  // Intention detection
  async determineIntent(message: string, state: any): Promise<string> {
    const ia = new GeminiService();
    const history = getHistoryParse(state);

    const prompt = `Eres un asistente de IA experto en comprender las intenciones de los usuarios.
    Tu tarea es analizar el mensaje del usuario y determinar su intención principal.
    ### Historial de Conversación ###
    ${history}

    ### Mensaje del usuario: ###
    ${message}

    Posibles acciones a realizar:

    HABLAR: Esta acción se debe realizar cuando el cliente desea hacer una pregunta o necesita más información sobre Sillas.com.co o sus productos.
    Objetivo:

    Comprender la intención del cliente en el contexto de la conversación con Sillas.com.co y seleccionar 
    la acción más adecuada en respuesta a su declaración.
    Consideraciones:

    * Sillas.com.co ofrece sillas ergonómicas de alta gama que ayudan en la postura y salud ocupacional.
    * El objetivo principal del bot es guiar al cliente, identificar sus necesidades y una vez identificada una intención o interés en un producto persuadir para que compre el producto.
    * El bot debe ser amigable, profesional y servicial.

    ### Instrucciones ###
      Analiza el mensaje del usuario y selecciona la acción más adecuada.
    Respuesta ideal (HABLAR):`;

    try {
      const result = await ia.generateContent(prompt);
      let intention = result.response.text().trim();
      // Ajusta según la estructura de la respuesta

      console.log("Respuesta cruda del modelo:", intention);
      // Extraer solo la primera palabra (la intención principal)
      const firstWordMatch = intention.match(/^\w+/);
      if (!firstWordMatch) {
        console.warn("No se pudo extraer la intención principal del modelo.");
        return "UNKNOWN";
      }

      intention = firstWordMatch[0].toUpperCase();

      console.log("Intención extraída:", intention);
      // Validar que la intención sea una de las opciones válidas
      const validIntents = ["HABLAR"];
      if (!validIntents.includes(intention)) {
        console.warn("Intención no válida detectada:", intention);
        return "UNKNOWN"; // Devuelve una intención desconocida si no coincide
      }

      return intention;
    } catch (error: any) {
      console.error(
        "Error al determinar la intención:",
        error.message || error
      );
      throw error; // Propaga el error para manejarlo en niveles superiores
    }
  }
}

export default MainLayer;
