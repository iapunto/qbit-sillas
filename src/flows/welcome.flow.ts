import { addKeyword, EVENTS } from "@builderbot/bot";
import intentFlow from "~/layers";
import conversationalLayer from "~/layers/conversational.layer";

const welcomeFlow = addKeyword(EVENTS.WELCOME)
  .addAction(conversationalLayer)
  .addAction(intentFlow);

export default welcomeFlow;
