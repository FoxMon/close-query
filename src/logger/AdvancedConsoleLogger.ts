import { QueryExecutor } from '../query/executor/QueryExecutor';
import { LogLevel, LogMessage } from './Logger';
import { LoggerBase } from './LoggerBase';
import { DialectPlatform } from '../dialect/DialectPlatform';

/**
 * `AdvancedConsoleLogger.ts`
 */
export class AdvancedConsoleLogger extends LoggerBase {
    readonly _instance = Symbol.for('AdvancedConsoleLogger');

    protected writeLog(
        level: LogLevel,
        logMessage: LogMessage | LogMessage[],
        _queryExecutor?: QueryExecutor,
    ) {
        const messages = this.prepareLogMessages(logMessage);

        for (const message of messages) {
            switch (message.type ?? level) {
                case 'log':
                case 'schema-build':
                    DialectPlatform.log(String(message.message));
                    break;

                case 'info':
                case 'query':
                    if (message.prefix) {
                        DialectPlatform.logInfo(message.prefix, message.message);
                    } else {
                        DialectPlatform.log(String(message.message));
                    }
                    break;

                case 'warn':
                case 'query-slow':
                    if (message.prefix) {
                        DialectPlatform.logWarn(message.prefix, message.message);
                    } else {
                        console.warn(DialectPlatform.warn(String(message.message)));
                    }
                    break;

                case 'error':
                case 'query-error':
                    if (message.prefix) {
                        DialectPlatform.logError(message.prefix, String(message.message));
                    } else {
                        console.error(DialectPlatform.error(String(message.message)));
                    }
                    break;
            }
        }
    }
}
