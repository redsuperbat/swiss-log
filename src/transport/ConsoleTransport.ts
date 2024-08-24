import type { Transport } from "./Transport.js";

export class ConsoleTransport implements Transport {
  send(entry: string): void {
    console.log(entry);
  }
}
