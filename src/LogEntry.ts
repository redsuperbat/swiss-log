import type { LogLevel } from "./LogLevel";

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
    string | number | boolean | Date | JsonSerializable | JsonArray
  > {}

export type LogEntry = {
  message: string;
  level: LogLevel;
  body?: JsonSerializable;
  context?: string;
  correlationId?: string;
};
