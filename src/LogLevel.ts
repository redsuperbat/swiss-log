export enum LogLevel {
  silent = -1,
  trace = 0,
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
  fatal = 5,
}

export namespace LogLevel {
  export function toReadable(level: LogLevel): string {
    switch (level) {
      case LogLevel.debug:
        return "debug";
      case LogLevel.trace:
        return "trace";
      case LogLevel.warn:
        return "warn";
      case LogLevel.error:
        return "error";
      case LogLevel.fatal:
        return "fatal";
      case LogLevel.info:
        return "info";
      case LogLevel.silent:
        return "silent";
    }
  }
  export function fromReadable(level: string): LogLevel {
    switch (level) {
      case "debug":
        return LogLevel.debug;
      case "trace":
        return LogLevel.trace;
      case "warn":
        return LogLevel.warn;
      case "error":
        return LogLevel.error;
      case "fatal":
        return LogLevel.fatal;
      case "info":
        return LogLevel.info;
      case "silent":
        return LogLevel.silent;
      default:
        throw new Error("invalid log level " + level);
    }
  }
}
