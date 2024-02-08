import { QueryExecutor } from '../query/executor/QueryExecutor';
import { LogLevel, LogMessage } from './Logger';
import { LoggerBase } from './LoggerBase';

/**
 * `SimpleConsoleLogger.ts`
 */
export class SimpleConsoleLogger extends LoggerBase {
    readonly _instance = Symbol.for('SimpleConsoleLogger');

    protected writeLog(
        level: LogLevel,
        logMessage: LogMessage | LogMessage[],
        _queryExecutor?: QueryExecutor,
    ) {
        const messages = this.prepareLogMessages(logMessage, {
            highlightSql: false,
        });

        for (const message of messages) {
            switch (message.type ?? level) {
                case 'log':
                case 'schema-build':
                    console.log(message.message);
                    break;

                case 'info':
                case 'query':
                    if (message.prefix) {
                        console.info(message.prefix, message.message);
                    } else {
                        console.info(message.message);
                    }
                    break;

                case 'warn':
                case 'query-slow':
                    if (message.prefix) {
                        console.warn(message.prefix, message.message);
                    } else {
                        console.warn(message.message);
                    }
                    break;

                case 'error':
                case 'query-error':
                    if (message.prefix) {
                        console.error(message.prefix, message.message);
                    } else {
                        console.error(message.message);
                    }
                    break;
            }
        }
    }
}
