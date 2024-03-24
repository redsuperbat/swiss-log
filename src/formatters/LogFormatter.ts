import type { LogEntry } from "../LogEntry";

export interface LogFormatter {
  format(entry: LogEntry): string;
}
