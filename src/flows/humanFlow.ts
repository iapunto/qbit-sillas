import { addKeyword, EVENTS } from "@builderbot/bot";
import { logger } from "../utils/logger";
import admins from "../data/admins.json";

const humanFlow = addKeyword(EVENTS.ACTION).addAction(
  async (ctx, { flowDynamic, provider }) => {
    try {
      logger.info(`Human Flow - Contacto ${ctx.from} solicita un asesor`);

      // 1. Obtener el número de teléfono del administrador desde el archivo de configuración
      const adminPhoneNumber = admins[0].phone;

      // 2. Enviar un mensaje de WhatsApp al administrador con el comando para mutear el bot
      const muteCommand = `mute ${ctx.from}`;
      await provider.sendMessage(
        adminPhoneNumber,
        `El cliente ${ctx.from} (Número: ${ctx.from}) necesita asistencia. Por favor, usa el comando "${muteCommand}" para mutear el bot y atender al cliente. Puedes copiar y pegar o reenviar este comando: ${muteCommand}`
      );
      await flowDynamic(
        "Estamos contactando a un administrador para que te asista."
      );
      return;
    } catch (error: any) {
      logger.error("HumanFlow - Error:", error.message || error);
      await flowDynamic(
        "Lo siento, ocurrió un error al procesar tu solicitud. 😕"
      );
    }
  }
);

export { humanFlow };
