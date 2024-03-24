import type { LogEntry } from "../LogEntry";
import { LogLevel } from "../LogLevel";
import type { LogFormatter } from "./LogFormatter";

export class GoogleCloudRunLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const log = JSON.stringify({
      severity: LogLevel.toReadable(entry.level),
      message: entry.message,
      body: entry.body,
      context: entry.context,
      correlationId: entry.correlationId,
    });
    return log;
  }
}
