import type { JsonSerializable, LogEntry } from "./LogEntry.js";
import { LogLevel } from "./LogLevel.js";
import { ConsoleLogFormatter } from "./formatters/ConsoleLogFormatter.js";
import type { LogFormatter } from "./formatters/LogFormatter.js";

export interface CorrelationIdProvider {
  get(): string | undefined;
}

export class Logger {
  #logLevel: LogLevel;
  #formatter: LogFormatter;
  #context?: string;
  #correlationIdProvider?: CorrelationIdProvider;
  #additionalProperties?: JsonSerializable;

  constructor(opts: {
    formatter: LogFormatter;
    logLevel?: LogLevel;
    context?: string;
    correlationIdProvider?: CorrelationIdProvider;
    additionalProperties?: JsonSerializable;
  }) {
    this.#context = opts.context;
    this.#formatter = opts.formatter;
    this.#correlationIdProvider = opts.correlationIdProvider;
    this.#logLevel = opts.logLevel ?? LogLevel.info;
    this.#additionalProperties = opts.additionalProperties;
  }

  /**
   * Creates a logger with formatter {@link ConsoleLogFormatter}
   */
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

  /**
   * Dynamically add an additional property to the logger instance
   */
  addProperty(key: string, value: JsonSerializable): void {
    this.#additionalProperties ??= {};
    this.#additionalProperties[key] = value;
  }

  #log(message: string, level: LogLevel, body?: JsonSerializable) {
    if (level === LogLevel.silent) return;
    if (this.#logLevel > level) {
      return;
    }
    const entry: LogEntry = {
      message,
      timestamp: new Date(),
      level,
      body,
      context: this.#context,
      correlationId: this.#correlationIdProvider?.get(),
      additionalProperties: this.#additionalProperties,
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
