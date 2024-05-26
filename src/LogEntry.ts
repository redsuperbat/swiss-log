import type { LogLevel } from "./LogLevel.js";

export interface JsonSerializable {
  [x: string]:
    | string
    | number
    | boolean
    | Date
    | JsonSerializable
    | JsonArray
    | null
    | undefined;
}
export interface JsonArray
  extends Array<
    | string
    | number
    | boolean
    | Date
    | JsonSerializable
    | JsonArray
    | null
    | undefined
  > {}

export type LogEntry = {
  message: string;
  level: LogLevel;
  body?: JsonSerializable;
  context?: string;
  correlationId?: string;
};
