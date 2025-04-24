import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config(); // Carga variables de entorno desde .env

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function testGemini() {
  try {
    const prompt = "Explica cómo funciona la energía solar en 3 puntos clave";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Respuesta de Gemini:");
    console.log(response.text());
  } catch (error) {
    console.error("Error al usar Gemini:", error);
  }
}

testGemini();
