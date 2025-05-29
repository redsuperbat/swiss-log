import test, { beforeEach, describe } from "node:test";
import { Logger } from "./Logger.js";
import { InMemoryTransport } from "./transport/InMemoryTransport.js";
import assert from "node:assert/strict";
import { JsonLogFormatter } from "./formatters/JsonLogFormatter.js";

describe("Logger", () => {
  let transport: InMemoryTransport;
  let logger: Logger;
  beforeEach(() => {
    transport = new InMemoryTransport();
    logger = new Logger({
      transports: [transport],
      formatter: new JsonLogFormatter(),
    });
  });

  test("Logger.captureError captures sync errors", () => {
    assert.throws(() =>
      logger.captureError(() => {
        throw new Error("bad");
      }),
    );
    assert.equal(transport.logs.length, 1);
  });

  test("Logger.captureError captures async errors", async () => {
    const willThrow = async () => {
      throw new Error("bad");
    };
    await assert.rejects(logger.captureError(willThrow()));
    assert.equal(transport.logs.length, 1);
  });
});
