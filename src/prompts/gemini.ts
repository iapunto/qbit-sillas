import { productList } from "~/data/products";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generateTextResponse = async (userMessage: string, history: string) => {
  console.log("Vigilance: Entering generateTextResponse function");
  console.log("Vigilance: User Message:", userMessage);
  console.log("Vigilance: Chat History:", history);

  const prompt = `
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
    (Use data from productList.ts to provide accurate info)
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

    Historial de Conversación :
    ${history}

    Mensaje del Usuario :
    ${userMessage}

    Formato de Respuesta :
    Lenguaje amigable, emojis relacionados (🪑, 🛒, 🎉).
    Prioridad a redirigir a ventas o contacto directo.
    `;

  try {
    console.log("Vigilance: Sending prompt to Gemini");
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    console.log("Vigilance: Received response from Gemini:", response);
    return response;
  } catch (error: any) {
    console.error("Vigilance: Error generating text:", error);
    return "Ocurrió un error al procesar tu solicitud. Por favor intenta más tarde.";
  }
};

export default async (ctx: any) => {
  console.log("Vigilance: Entering geminiHandler");
  console.log("Vigilance: Context:", ctx);

  const userMessage = ctx?.event?.text;
  const history = ctx.state.history || ""; // Get chat history from context

  console.log("Vigilance: Extracted User Message:", userMessage);
  console.log("Vigilance: Extracted Chat History:", history);

  const aiResponse = await generateTextResponse(userMessage, history);

  console.log("Vigilance: AI Response:", aiResponse);

  // Update chat history (basic, you might want to manage this more robustly)
  ctx.state.history = history + `\nUsuario: ${userMessage}\nBot: ${aiResponse}`;

  console.log("Vigilance: Updated Chat History:", ctx.state.history);

  await ctx.reply(aiResponse);

  console.log("Vigilance: Response sent to user");
};
