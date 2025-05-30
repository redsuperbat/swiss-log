import type { JsonSerializable, LogEntry } from "./LogEntry.js";
import { LogLevel } from "./LogLevel.js";
import { ConsoleLogFormatter } from "./formatters/ConsoleLogFormatter.js";
import type { LogFormatter } from "./formatters/LogFormatter.js";
import { serializeError } from "./serializeError.js";
import { ConsoleTransport } from "./transport/ConsoleTransport.js";
import type { Transport } from "./transport/Transport.js";

export interface CorrelationIdProvider {
  get(): string | undefined;
}

export type LoggerOpts = {
  /**
   *
   *  Swiss log has a single interface for formatting logs. The interface implements a single method `LogFormatter.format` which receives a `LogEntry` and returns a string.
   *  Swiss log has a couple of formatters that you can use directly but it also supports creating your own formatters.
   *
   *  The default formatter is the `ConsoleLogFormatter` which prints the logs in the following format:
   *
   *  ```sh
   *  [2024-03-29T17:18:12.505Z] INFO [NoContext] started server {"port":3030}
   *  ```
   *
   *  Using swiss-log in google cloud run:
   *
   *  ```typescript
   *  import { GoogleCloudRunLogFormatter, Logger } from "swiss-log";
   *
   *  const logger = new Logger({
   *    formatter: new GoogleCloudRunLogFormatter(),
   *  });
   *
   *  logger.info("Hello"); // Will print logs in a structured JSON format compatible with google cloud run
   *  ```
   *
   *  Implementing your own log formatter
   *
   *  ```typescript
   *  import { Logger, type LogFormatter, type LogEntry } from "swiss-log";
   *
   *  const simpleFormatter: LogFormatter = {
   *    format(entry: LogEntry): string {
   *      return entry.message;
   *    },
   *  };
   *  const logger = new Logger({ formatter: simpleFormatter });
   *
   *  logger.info("Hello"); // Will print only the string passed to the logger
   */
  formatter?: LogFormatter;
  /**
   * Log level of the logger instance
   */
  logLevel?: LogLevel;
  /**
   * Context of the logger
   */
  context?: string;
  /**
   *  When developing API:s it's common practice to attach a request scoped correlation id to the logger. swiss-log allows you to easily do this by providing a `CorrelationIdProvider` to the logger constructor.
   *
   *  ```typescript
   *  import {
   *    Logger,
   *    JsonLogFormatter,
   *    type CorrelationIdProvider,
   *  } from "swiss-log";
   *  import { AsyncLocalStorage } from "node:async_hooks";
   *
   *  const asyncStore = new AsyncLocalStorage<{ correlationId: string }>();
   *  const asyncStoreIdProvider: CorrelationIdProvider = {
   *    get: () => asyncStore.getStore()?.correlationId,
   *  };
   *
   *  const logger = new Logger({
   *    formatter: new JsonLogFormatter(),
   *    correlationIdProvider: asyncStoreIdProvider,
   *  });
   *
   *  // Will pass the correlationId to the log entry and print
   *  // { "message": "hello", "correlationId": "<my-correlation-id>", "level": 0 }
   *  logger.info("Hello");
   *  ```
   *
   */
  correlationIdProvider?: CorrelationIdProvider;
  /**
   * Custom attributes which will be accessible to the log formatter when formatting your log
   */
  additionalProperties?: JsonSerializable;
  /**
   * Transports are outputs for logs after they have been passed through the formatter
   *
   * The default transport is the `ConsoleTransport` which outputs the log to the console
   *
   * To supply your own transport implement the Transport interface
   *
   * ```typescript
   * import { Transport } from 'swiss-log';
   *
   * class HttpTransport implements Transport {
   *   async send(log: string) {
   *     await fetch("/api/logs", { method: "POST", body: log });
   *   }
   * }
   *
   * // Will log to both http and console
   * const logger = new Logger({
   *   transports: [new HttpTransport(), new ConsoleTransport()]
   * })
   * ```
   */
  transports?: Transport[];
};

export class Logger {
  #logLevel: LogLevel;
  #formatter: LogFormatter;
  #transports: Transport[];

  #context?: string;
  #correlationIdProvider?: CorrelationIdProvider;
  #additionalProperties?: JsonSerializable;

  constructor(opts: LoggerOpts = {}) {
    this.#logLevel = opts.logLevel ?? LogLevel.info;
    this.#formatter = opts.formatter ?? new ConsoleLogFormatter();
    this.#transports = opts.transports ?? [new ConsoleTransport()];

    this.#context = opts.context;
    this.#correlationIdProvider = opts.correlationIdProvider;
    this.#additionalProperties = opts.additionalProperties;
  }

  /**
   * Creates a logger with a console friendly formatter and
   * a console transport. Ideal for development
   */
  static withDefaults(): Logger {
    return new Logger();
  }

  setContext(context: string): Logger {
    this.#context = context;
    return this;
  }

  setLogLevel(level: LogLevel): Logger {
    this.#logLevel = level;
    return this;
  }

  setFormatter(formatter: LogFormatter): Logger {
    this.#formatter = formatter;
    return this;
  }

  setTransports(transports: Transport[]): Logger {
    this.#transports = transports;
    return this;
  }

  setTransport(transport: Transport): Logger {
    this.#transports = [transport];
    return this;
  }

  addTransport(transport: Transport): Logger {
    this.#transports.push(transport);
    return this;
  }

  /**
   * Clones the logger with a new context, useful for injecting into
   * other classes
   *
   * ```typescript
   * class WandService {
   *   #logger: Logger;
   *   constructor(logger: Logger) {
   *     this.#logger = logger.cloneWithContext(WandService.name)
   *   }
   * }
   * ```
   */
  cloneWithContext(context: string): Logger {
    return this.clone().setContext(context);
  }

  /**
   * Clones the logger instance passing all instance attributes
   * to the new instance
   */
  clone(): Logger {
    return new Logger({
      additionalProperties: this.#additionalProperties,
      context: this.#context,
      formatter: this.#formatter,
      correlationIdProvider: this.#correlationIdProvider,
      logLevel: this.#logLevel,
      transports: this.#transports,
    });
  }

  /**
   * Add an additional property to the logger instance
   */
  addProperty(key: string, value: JsonSerializable[string]): Logger {
    this.addProperties({ [key]: value });
    return this;
  }

  /**
   * Add additional properties to the logger instance
   */
  addProperties(properties: JsonSerializable) {
    this.#additionalProperties ??= {};
    for (const [k, v] of Object.entries(properties)) {
      this.#additionalProperties[k] = v;
    }
    return this;
  }

  /**
   * Captures and logs any error as an "error" log.
   * The captured error is not modified and re-thrown.
   *
   * ```typescript
   * const logger = Logger.withDefaults();
   * const response = await logger.captureError(fetch("/api/data"));
   * ```
   */
  captureError<T>(operation: () => T, message?: string): T;
  captureError<T>(operation: Promise<T>, message?: string): Promise<T>;
  captureError<T>(
    operation: Promise<T> | (() => T),
    message = "unhandled error",
  ): T | Promise<T> {
    if (operation instanceof Promise) {
      return operation.catch((e) => {
        this.error(message, { error: serializeError(e) });
        throw e;
      });
    }
    try {
      return operation();
    } catch (e) {
      this.error(message, { error: serializeError(e) });
      throw e;
    }
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
    for (const t of this.#transports) {
      t.send(log);
    }
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
