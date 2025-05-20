import { logger } from "./logger";
import * as fs from "fs";
import * as path from "path";

const blacklistPath = path.join(__dirname, "../data/blacklist.json");

export class Blacklist {
  private static instance: Blacklist;
  private blacklist: Set<string>;
  private adminNumber: string;

  private constructor(adminNumber: string) {
    this.blacklist = new Set(this.loadBlacklist());
    this.adminNumber = adminNumber;
  }

  public static getInstance(adminNumber: string): Blacklist {
    if (!Blacklist.instance) {
      Blacklist.instance = new Blacklist(adminNumber);
    }
    return Blacklist.instance;
  }

  private loadBlacklist(): string[] {
    try {
      const data = fs.readFileSync(blacklistPath, "utf-8");
      return JSON.parse(data);
    } catch (error: any) {
      logger.warn(
        `Blacklist - Error al cargar blacklist.json, inicializando con lista vacía: ${
          error.message || error
        }`
      );
      return [];
    }
  }

  private saveBlacklist(): void {
    try {
      const data = JSON.stringify(Array.from(this.blacklist));
      fs.writeFileSync(blacklistPath, data, "utf-8");
      logger.info(`Blacklist - blacklist.json actualizado correctamente.`);
    } catch (error: any) {
      logger.error(
        `Blacklist - Error al guardar blacklist.json: ${error.message || error}`
      );
    }
  }

  public add(number: string): void {
    this.blacklist.add(number);
    this.saveBlacklist();
  }

  public remove(number: string): void {
    this.blacklist.delete(number);
    this.saveBlacklist();
  }

  public has(number: string): boolean {
    return this.blacklist.has(number);
  }

  public isAdmin(number: string): boolean {
    return number === this.adminNumber;
  }
}
