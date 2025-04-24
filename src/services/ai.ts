import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "~/config";

const genAI = new GoogleGenerativeAI(config.googleApiKey!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateResponse(
  userMessage: string,
  history: string
): Promise<string> {
  console.info(
    "[generateResponse] Generando respuesta para el mensaje:",
    userMessage
  );

  const COMPANY_INFO = `
    Empresa: Sillas.com.co
    Especialidad: Sillas ergonómicas para oficina y estudio
    Productos destacados: 
      - Sihoo Doro S300 (Negro/Gris)
      - Ergomax M97B
      - Sihoo Presidencial Star V1
    Promociones vigentes: 
      - Preventa Sihoo Doro S300 hasta abril 2025 (10% OFF)
    Contacto: 
      Instagram: @sillas.com.co
      WhatsApp: +57 316 376 9935
  `;

  const historyText = history
    .map(
      (msg) =>
        `${msg.role === "user" ? "Usuario" : "Asistente"}: ${msg.content}`
    )
    .join("\n");

  const prompt = `
    Eres un asistente de ventas para Sillas.com.co.
    Información de la empresa: ${COMPANY_INFO}
    Historial de conversación: {history}
    Mensaje del usuario: ${userMessage}
    Respuesta: 
  `;

  try {
    console.info("[generateResponse] Enviando prompt a la IA...");
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.debug(
      "[generateResponse] Respuesta recibida de la IA:",
      responseText
    );
    return responseText;
  } catch (error) {
    console.error("[generateResponse] Error al generar la respuesta:", error);
    return "Ocurrió un error al procesar tu solicitud. Por favor intenta más tarde.";
  }
}
