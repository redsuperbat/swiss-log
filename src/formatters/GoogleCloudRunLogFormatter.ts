import type { LogEntry } from "../LogEntry.js";
import { LogLevel } from "../LogLevel.js";
import type { LogFormatter } from "./LogFormatter.js";

export class GoogleCloudRunLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const log = JSON.stringify({
      severity: LogLevel.toReadable(entry.level),
      message: entry.message,
      body: entry.body,
      context: entry.context,
      correlationId: entry.correlationId,
      timestamp: entry.timestamp,
      ...entry.additionalProperties,
    });
    return log;
  }
}
