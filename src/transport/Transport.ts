export interface Transport {
  send(entry: string): Promise<void> | void;
}
