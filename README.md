# swiss-log

A logger with sensible defaults.

## Examples

Default logger

```ts
import { Logger } from 'swiss-logger';

// Initalizes a logger with logLevel 'info' and `ConsoleLogFormatter` as the formatter
const logger = Logger.withDefaults();
logger.info("swiss log");
```

There are formatters for different use-cases.

- GoogleCloudRunLogFormatter
- ConsoleLogFormatter


