import test, { describe } from "node:test";
import { ConsoleLogFormatter } from "./ConsoleLogFormatter";
import { LogLevel } from "../LogLevel";
import assert from "node:assert";

describe("ConsoleLogFormatter", () => {
  const formatter = new ConsoleLogFormatter({ pretty: true });

  test("pretty if pretty", () => {
    const format = formatter.format({
      level: LogLevel.info,
      message: "Test",
      timestamp: new Date(),
      body: {
        hello: "World",
        you: ["are", 3],
      },
    });
    assert(format);
  });
});
