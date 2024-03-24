import type { LogEntry } from "../LogEntry";
import { LogLevel } from "../LogLevel";
import type { LogFormatter } from "./LogFormatter";

export class ConsoleLogFormatter implements LogFormatter {
  #clc = {
    bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
    green: (text: string) => `\x1B[32m${text}\x1B[39m`,
    yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
    red: (text: string) => `\x1B[31m${text}\x1B[39m`,
    magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
    cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
    gray: (text: string) => `\x1b[90m${text}\x1B[0m`,
  };

  #logLevelToColor(level: LogLevel): (message: string) => string {
    switch (level) {
      case LogLevel.debug:
        return this.#clc.magentaBright;
      case LogLevel.info:
        return this.#clc.green;
      case LogLevel.trace:
        return this.#clc.cyanBright;
      case LogLevel.error:
        return this.#clc.red;
      case LogLevel.fatal:
        return this.#clc.red;
      case LogLevel.warn:
        return this.#clc.yellow;
      case LogLevel.silent:
        throw new Error("silent log level should not be passed");
    }
  }

  format(entry: LogEntry): string {
    const { body, level } = entry;
    let { message, context } = entry;
    const colorFn = this.#logLevelToColor(level);
    const readableLevel = LogLevel.toReadable(level).toUpperCase();
    const colorLevel = colorFn(readableLevel);
    message = colorFn(message);
    const timestamp = new Date().toISOString();
    context = this.#clc.yellow(`[${context ?? "NoContext"}]`);
    message = `[${timestamp}] ${colorLevel}\t${context} ${message}`;
    return `${message} ${body ? this.#clc.gray(JSON.stringify(body)) : ""}`;
  }
}
