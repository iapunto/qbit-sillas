// src/utils/logger.ts

export const logger = {
  info: (...args: any[]) => console.info("[INFO]", ...args),
  debug: (...args: any[]) => console.debug("[DEBUG]", ...args),
  error: (...args: any[]) => console.error("[ERROR]", ...args),
};
