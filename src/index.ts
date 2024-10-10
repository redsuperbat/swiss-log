import { Logger } from "./Logger.js";

export type { LoggerOpts } from "./Logger.js";
export { LogLevel } from "./LogLevel.js";
export type { JsonSerializable, JsonArray, LogEntry } from "./LogEntry.js";
export { ConsoleLogFormatter } from "./formatters/ConsoleLogFormatter.js";
export { GoogleCloudRunLogFormatter } from "./formatters/GoogleCloudRunLogFormatter.js";
export { JsonLogFormatter } from "./formatters/JsonLogFormatter.js";
export type { CorrelationIdProvider } from "./Logger.js";
export type { Transport } from "./transport/Transport.js";
export { ConsoleTransport } from "./transport/ConsoleTransport.js";
export { Logger };

export default Logger.withDefaults();
