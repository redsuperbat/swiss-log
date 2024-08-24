import type { Transport } from "./Transport";

export class InMemoryTransport implements Transport {
  logs: string[] = [];
  send(entry: string): void {
    this.logs.push(entry);
  }
}
