import { addKeyword, EVENTS } from "@builderbot/bot";
import MainLayer from "./main.layer";
import { BotContext, BotMethods } from "@builderbot/bot/dist/types";
import sellerFlow from "../flows/seller.flow";

const intentions = new MainLayer();

const intentFlow = addKeyword(EVENTS.ACTION).addAction(
  async (ctx: BotContext, { gotoFlow, flowDynamic, state }: BotMethods) => {
    try {
      // Obtener el mensaje del usuario
      const message = ctx.body;
      console.log("Mensaje recibido: ", message);

      // Determinar la intención del usuario
      const intention = await intentions.determineIntent(message, state);
      console.log("Intención detectada: ", intention);

      // Seleccionar la acción adecuada según la intención del usuario
      if (intention === "HABLAR") {
        return gotoFlow(sellerFlow);
      }

      // Si no se detecta una intención válida
      await flowDynamic(
        "Lo siento, no pude entender tu mensaje. ¿Podrías reformularlo?"
      );
    } catch (error) {
      console.error(error);
    }
  }
);

export default intentFlow;
