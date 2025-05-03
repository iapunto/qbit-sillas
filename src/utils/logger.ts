// src/utils/logger.ts
import chalk from "chalk";

function getTimestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (...args: any[]) =>
    console.info(`${chalk.blue('[INFO]')} [${getTimestamp()}]`, ...args),
  debug: (...args: any[]) =>
    console.debug(`${chalk.magenta('[DEBUG]')} [${getTimestamp()}]`, ...args),
  warn: (...args: any[]) =>
    console.warn(`${chalk.yellow('[WARN]')} [${getTimestamp()}]`, ...args),
  error: (...args: any[]) =>
    console.error(`${chalk.red('[ERROR]')} [${getTimestamp()}]`, ...args),
};
