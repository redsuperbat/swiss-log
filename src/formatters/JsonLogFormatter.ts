import type { LogEntry } from "../LogEntry.js";
import type { LogFormatter } from "./LogFormatter.js";

export class JsonLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }
}
