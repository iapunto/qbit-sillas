// src/flows/welcomeFlow.ts

import { EVENTS, addKeyword } from "@builderbot/bot";
import generateResponse from "~/prompts/gemini";
import { logger } from "~/utils/logger";

export default addKeyword(EVENTS.WELCOME).addAction(generateResponse);
