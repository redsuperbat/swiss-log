import test, { describe } from "node:test";
import { Logger } from "./Logger.js";
import { InMemoryTransport } from "./transport/InMemoryTransport.js";
import assert from "node:assert/strict";
import { JsonLogFormatter } from "./formatters/JsonLogFormatter.js";

describe("Logger", () => {
  let transport: InMemoryTransport;
  const createLogger = () => {
    transport = new InMemoryTransport();
    return new Logger({
      transports: [transport],
      formatter: new JsonLogFormatter(),
    });
  };

  test("Logger.captureAsyncError", async () => {
    const willThrow = async () => {
      throw new Error("bad");
    };
    await assert.rejects(createLogger().captureAsyncError(willThrow()));
    assert.equal(transport.logs.length, 1);
  });
});
