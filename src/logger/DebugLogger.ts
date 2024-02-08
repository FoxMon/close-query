import { QueryExecutor } from '../query/executor/QueryExecutor';
import { LogLevel, LogMessage, LogMessageType } from './Logger';
import { LoggerBase } from './LoggerBase';
import { debug, Debugger } from 'debug';

/**
 * `DebugLogger.ts`
 */
export class DebugLogger extends LoggerBase {
    private logger: Record<string, Debugger> = {
        log: debug('typeorm:log'),
        info: debug('typeorm:info'),
        warn: debug('typeorm:warn'),
        error: debug('typeorm:error'),
        query: debug('typeorm:query:log'),
        'query-error': debug('typeorm:query:error'),
        'query-slow': debug('typeorm:query:slow'),
        'schema-build': debug('typeorm:schema'),
        migration: debug('typeorm:migration'),
    };

    protected isLogEnabledFor(type?: LogLevel | LogMessageType) {
        switch (type) {
            case 'query':
                return this.logger['query'].enabled;

            case 'query-error':
                return this.logger['query-error'].enabled;

            case 'query-slow':
                return true;

            case 'schema':
            case 'schema-build':
                return this.logger['schema-build'].enabled;

            case 'migration':
                return this.logger['migration'].enabled;

            case 'log':
                return this.logger['log'].enabled;

            case 'info':
                return this.logger['info'].enabled;

            case 'warn':
                return this.logger['warn'].enabled;

            default:
                return false;
        }
    }

    protected writeLog(
        level: LogLevel,
        logMessage: LogMessage | LogMessage[],
        _queryExecutor?: QueryExecutor,
    ) {
        const messages = this.prepareLogMessages(logMessage, {
            appendParameterAsComment: false,
        });

        for (const message of messages) {
            const messageTypeOrLevel = message.type ?? level;

            if (messageTypeOrLevel in this.logger) {
                if (message.prefix) {
                    this.logger[messageTypeOrLevel](message.prefix, message.message);
                } else {
                    this.logger[messageTypeOrLevel](message.message);
                }

                if (message.params && message.params.length) {
                    this.logger[messageTypeOrLevel]('parameters:', message.params);
                }
            }
        }
    }
}
