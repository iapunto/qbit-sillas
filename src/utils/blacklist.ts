export class Blacklist {
  private static instance: Blacklist;
  private blacklist: Set<string>;
  private adminNumber: string;

  private constructor(adminNumber: string) {
    this.blacklist = new Set();
    this.adminNumber = adminNumber;
  }

  public static getInstance(adminNumber: string): Blacklist {
    if (!Blacklist.instance) {
      Blacklist.instance = new Blacklist(adminNumber);
    }
    return Blacklist.instance;
  }

  public add(number: string): void {
    this.blacklist.add(number);
  }

  public remove(number: string): void {
    this.blacklist.delete(number);
  }

  public has(number: string): boolean {
    return this.blacklist.has(number);
  }

  public isAdmin(number: string): boolean {
    return number === this.adminNumber;
  }
}
