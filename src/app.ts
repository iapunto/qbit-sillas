import { createBot, createFlow } from "@builderbot/bot";
import { provider } from "~/provider";
import { adapterDB } from "~/database";
import welcomeFlow from "~/flows/welcome.flow";
import { config } from "~/config";
import sellerFlow from "~/flows/seller.flow";

const PORT = config.port;
const main = async () => {
  console.log("Iniciando la aplicación...");
  // Log al inicio
  const adapterFlow = createFlow([welcomeFlow, sellerFlow]);
  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider: provider,
    database: adapterDB,
  });
  httpServer(+PORT);
  console.log(`Servidor escuchando en el puerto ${PORT}`); // Log del puerto
};

main();
