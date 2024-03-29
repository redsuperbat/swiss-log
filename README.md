# swiss-log

A logger with sensible defaults.

## Quickstart

Default logger

```ts
import { Logger } from "swiss-logger";

// Initializes a logger with logLevel 'info' and `ConsoleLogFormatter` as the formatter
const logger = Logger.withDefaults();
logger.info("swiss log");
```

## Formatters

Swiss log has a single interface for formatting logs. The interface implements a single method `LogFormatter.format` which receives a `LogEntry` and returns a string.
Swiss log has a couple of formatters that you can use directly but it also supports creating your own formatters.

The default formatter is the `ConsoleLogFormatter` which prints the logs in the following format:

```shell
[2024-03-29T17:18:12.505Z] INFO [NoContext] started server {"port":3030}
```

Using swiss-log in google cloud run:

```ts
import { GoogleCloudRunLogFormatter, Logger } from "swiss-log";

const logger = new Logger({
  formatter: new GoogleCloudRunLogFormatter(),
});

// Will print logs in a structured JSON format compatible with google cloud run
logger.info("Hello");
```

Implementing your own log formatter

```ts
import { Logger, type LogFormatter, type LogEntry } from "swiss-log";

const simpleFormatter: LogFormatter = {
  format(entry: LogEntry): string {
    return entry.message;
  },
};
const logger = new Logger({ formatter: simpleFormatter });

// Will print only the string passed to the logger
logger.info("Hello");
```

## Correlation ID

When developing API:s it's common practice to attach a request scoped correlation id to the logger. swiss-log allows you to easily do this by providing a `CorrelationIdProvider` to the logger constructor.

```ts
import {
  Logger,
  JsonLogFormatter,
  type CorrelationIdProvider,
} from "swiss-log";
import { AsyncLocalStorage } from "node:async_hooks";

const asyncStore = new AsyncLocalStorage<{ correlationId: string }>();
const asyncStoreIdProvider: CorrelationIdProvider = {
  get: (entry: LogEntry) => asyncStore.getStore()?.correlationId,
};

const logger = new Logger({
  formatter: new JsonLogFormatter(),
  correlationIdProvider: asyncStoreIdProvider,
});

// Will pass the correlationId to the log entry and print
// { "message": "hello", "correlationId": "<my-correlation-id>", "level": 0 }
logger.info("Hello");
```
