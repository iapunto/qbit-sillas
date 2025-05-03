import { createBot, createFlow } from "@builderbot/bot";
import { provider } from "~/provider";
import { adapterDB } from "~/database";
import welcomeFlow from "~/flows/welcome.flow";
import { config } from "~/config";
import sellerFlow from "~/flows/seller.flow";
import { logger } from "~/utils/logger";
import { saveBotMessageToDB } from "~/utils/handledHistory";
import { getConversationByContact } from "~/database/messageRepository";
import { getAllContacts } from "~/database/contactRepository"; 

const PORT = config.port;

function setupRoutes(handleCtx: any) {
  provider.server.post(
    "/v1/messages",
    handleCtx(async (bot: any, req: any, res: any) => {
      const { number, message, urlMedia } = req.body;
      await bot?.sendMessage(number, message, { media: urlMedia ?? null });
      await saveBotMessageToDB(number, message, urlMedia);
      return res.end("sended");
    })
  );
  
  // NUEVO ENDPOINT PARA OBTENER LA CONVERSACIÓN DE UN CONTACTO
  provider.server.get(
    "/v1/contacts/:contactId/conversation",
    handleCtx(async (_bot: any, req: any, res: any) => {
      const { contactId } = req.params;
      try {
        const messages = await getConversationByContact(Number(contactId));
        res.end(JSON.stringify(messages));
      } catch (error) {
        logger.error("Error al obtener la conversación:", error);
        res.status(500).json({ error: "Error al obtener la conversación" });
      }
    })
  );

  provider.server.get(
    "/v1/contacts",
    handleCtx(async (_bot: any, _req: any, res: any) => {
      try {
        const contacts = await getAllContacts();
        res.end(JSON.stringify(contacts));
      } catch (error) {
        logger.error("Error al obtener los contactos:", error);
        res.status(500).end(JSON.stringify({ error: "Error al obtener los contactos" }));
      }
    })
  );
}



async function initializeBot() {
  logger.info("Iniciando la aplicación...");
  const adapterFlow = createFlow([welcomeFlow, sellerFlow]);
  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: provider,
    database: adapterDB,
  });
  setupRoutes(handleCtx);
  return httpServer;
}

async function startServer() {
  try {
    const httpServer = await initializeBot();
    httpServer(+PORT);
    logger.info(`Servidor escuchando en el puerto ${PORT}`);
  } catch (error) {
    logger.error("Error al iniciar la aplicación:", error);
    process.exit(1);
  }
}

startServer();
