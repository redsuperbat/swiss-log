import type { LogEntry } from "../LogEntry.js";

export interface LogFormatter {
  format(entry: LogEntry): string;
}
