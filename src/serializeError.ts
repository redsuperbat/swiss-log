import type { JsonSerializableValue } from "./LogEntry";

export function serializeError(error: unknown): JsonSerializableValue {
  if (error instanceof Error) {
    return {
      name: error.name,
      stack: error.stack,
      cause: serializeError(error.cause),
    };
  }

  if (error === undefined) {
    return;
  }

  if (error === null) {
    return "null error";
  }

  if (typeof error === "object") {
    return Object.fromEntries(
      Object.entries(error).map(([key, val]) => [key, serializeError(val)]),
    );
  }

  if (Array.isArray(error)) {
    return error.map(serializeError);
  }

  return String(error);
}
