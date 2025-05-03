import { createBot, createFlow } from "@builderbot/bot";
import { provider } from "~/provider";
import { adapterDB } from "~/database";
import welcomeFlow from "~/flows/welcome.flow";
import { config } from "~/config";
import sellerFlow from "~/flows/seller.flow";
import { logger } from "~/utils/logger";
import { saveBotMessageToDB } from "~/utils/handledHistory";

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
