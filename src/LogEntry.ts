import type { LogLevel } from "./LogLevel.js";

export type JsonSerializableValue =
  | string
  | number
  | boolean
  | Date
  | JsonSerializable
  | JsonArray
  | null
  | undefined;

export interface JsonSerializable {
  [x: string]: JsonSerializableValue;
}

export interface JsonArray extends Array<JsonSerializableValue> {}

export type LogEntry = {
  message: string;
  level: LogLevel;
  body?: JsonSerializable;
  context?: string;
  correlationId?: string;
  timestamp: Date;
  /**
   * Additional properties which can be passed into the logger constructor
   * Good usecases are for request scoped properties
   */
  additionalProperties?: JsonSerializable;
};
