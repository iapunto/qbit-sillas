// src/provider.ts

import { createProvider } from "@builderbot/bot";
import { MetaProvider } from "@builderbot/provider-meta";
import { config } from "~/config";

export const provider = createProvider(MetaProvider, {
  jwtToken: config.jwtToken,
  numberId: config.numberId,
  verifyToken: config.verifyToken,
  version: config.version,
});
