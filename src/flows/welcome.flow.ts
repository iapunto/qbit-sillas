import { addKeyword, EVENTS } from "@builderbot/bot";
import { handleIntents } from "~/handlers"; // Importa el handler de intenciones
import conversationalLayer from "~/layers/conversational.layer";
import { logger } from "~/utils/logger"; // Importa el logger

const welcomeFlow = addKeyword(EVENTS.WELCOME)
  .addAction(conversationalLayer)
  .addAction(handleIntents); // Usa el handler de intenciones

export default welcomeFlow;
