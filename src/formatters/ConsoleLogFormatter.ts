import type { LogEntry } from "../LogEntry.js";
import { LogLevel } from "../LogLevel.js";
import type { LogFormatter } from "./LogFormatter.js";

type ColorFn = (text: string) => string;

export class ConsoleLogFormatter implements LogFormatter {
  #pretty: boolean;
  constructor({ pretty }: { pretty?: boolean }) {
    this.#pretty = pretty ?? false;
  }
  #colors: Record<LogLevel, ColorFn> = {
    [LogLevel.debug]: (text: string) => `\x1B[95m${text}\x1B[39m`,
    [LogLevel.info]: (text: string) => `\x1B[32m${text}\x1B[39m`,
    [LogLevel.trace]: (text: string) => `\x1B[96m${text}\x1B[39m`,
    [LogLevel.error]: (text: string) => `\x1B[31m${text}\x1B[39m`,
    [LogLevel.fatal]: (text: string) => `\x1B[31m${text}\x1B[39m`,
    [LogLevel.warn]: (text: string) => `\x1B[33m${text}\x1B[39m`,
    [LogLevel.silent]: (text: string) => text,
  };
  #clc = {
    yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
    gray: (text: string) => `\x1b[90m${text}\x1B[0m`,
  };

  format(entry: LogEntry): string {
    const { body, level, timestamp } = entry;
    let { message, context } = entry;
    const colorFn = this.#colors[level];
    const readableLevel = LogLevel.toReadable(level)
      .toUpperCase()
      .padEnd(5, " ");
    const colorLevel = colorFn(readableLevel);
    message = colorFn(message);
    context = this.#clc.yellow(`[${context ?? "NoContext"}]`);
    message = `[${timestamp.toISOString()}] ${colorLevel} ${context} ${message}`;
    return `${message} ${body ? this.#clc.gray(JSON.stringify(body, null, this.#pretty ? 2 : 0)) : ""}`;
  }
}
