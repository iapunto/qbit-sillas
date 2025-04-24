import { createBot, createFlow } from "@builderbot/bot";
import { MemoryDB } from "@builderbot/bot";
import { config } from "./config";
import welcomeFlow from "~/flows/welcomeFlow";
import { provider } from "~/provider";

const PORT = process.env.PORT ?? 3008;

const main = async () => {
  const adapterFlow = createFlow([welcomeFlow]);
  const { httpServer } = await createBot({
    flow: adapterFlow,
    provider,
    database: new MemoryDB(),
  });

  httpServer(+config.port);
};

main().catch((err) => {
  console.error("Error al iniciar el bot:", err);
});
