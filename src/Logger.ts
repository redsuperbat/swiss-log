import type { JsonSerializable, LogEntry } from "./LogEntry";
import { LogLevel } from "./LogLevel";
import { ConsoleLogFormatter } from "./formatters/ConsoleLogFormatter";
import type { LogFormatter } from "./formatters/LogFormatter";

export interface CorrelationIdProvider {
  get(): string | undefined;
}

export class Logger {
  #logLevel: LogLevel;
  #formatter: LogFormatter;
  #context?: string;
  #correlationIdProvider?: CorrelationIdProvider;

  constructor(opts: {
    formatter: LogFormatter;
    logLevel?: LogLevel;
    context?: string;
    correlationIdProvider?: CorrelationIdProvider;
  }) {
    this.#context = opts.context;
    this.#formatter = opts.formatter;
    this.#correlationIdProvider = opts.correlationIdProvider;
    this.#logLevel = opts.logLevel ?? LogLevel.info;
  }

  static withDefaults(): Logger {
    return new Logger({
      formatter: new ConsoleLogFormatter(),
    });
  }

  setContext(context: string): void {
    this.#context = context;
  }

  setLogLevel(level: LogLevel): void {
    this.#logLevel = level;
  }
  #log(message: string, level: LogLevel, body?: JsonSerializable) {
    if (level === LogLevel.silent) return;
    if (this.#logLevel > level) {
      return;
    }
    const entry: LogEntry = {
      message,
      level,
      body,
      context: this.#context,
      correlationId: this.#correlationIdProvider?.get(),
    };
    const log = this.#formatter.format(entry);
    console.log(log);
  }

  info(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.info, body);
  }
  fatal(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.fatal, body);
  }
  error(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.error, body);
  }
  warn(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.warn, body);
  }
  debug(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.debug, body);
  }
  trace(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.trace, body);
  }
  silent(msg: string, body?: JsonSerializable) {
    this.#log(msg, LogLevel.silent, body);
  }
}
