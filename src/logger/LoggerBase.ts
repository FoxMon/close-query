/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialectPlatform } from '../dialect/DialectPlatform';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { LogLevel, LogMessage, LogMessageType, Logger, PrepareLogMessagesOption } from './Logger';
import { LoggerOption } from './LoggerOption';

/**
 * `LoggerBase.ts`
 *
 * Logger의 추상 class 정의
 */
export abstract class LoggerBase implements Logger {
    readonly _instance = Symbol.for('LoggerBase');

    readonly option?: LoggerOption;

    constructor(option?: LoggerOption) {
        this.option = option;
    }

    logQuery(query: string, params?: any[], queryExecutor?: QueryExecutor) {
        if (!this.isLogEnabledFor('query')) {
            return;
        }

        this.writeLog(
            'query',
            {
                type: 'query',
                prefix: 'query',
                message: query,
                format: 'sql',
                params,
            },
            queryExecutor,
        );
    }

    logQueryError(error: string, query: string, params?: any[], queryExecutor?: QueryExecutor) {
        if (!this.isLogEnabledFor('query-error')) {
            return;
        }

        this.writeLog(
            'warn',
            [
                {
                    type: 'query-error',
                    prefix: 'query failed',
                    message: query,
                    format: 'sql',
                    params,
                },
                {
                    type: 'query-error',
                    prefix: 'error',
                    message: error,
                },
            ],
            queryExecutor,
        );
    }

    logQuerySlow(time: number, query: string, params?: any[], queryExecutor?: QueryExecutor) {
        if (!this.isLogEnabledFor('query-slow')) {
            return;
        }

        this.writeLog(
            'warn',
            [
                {
                    type: 'query-slow',
                    prefix: 'query is slow',
                    message: query,
                    format: 'sql',
                    params,
                    additionalInfo: {
                        time,
                    },
                },
                {
                    type: 'query-slow',
                    prefix: 'execution time',
                    message: time,
                },
            ],
            queryExecutor,
        );
    }

    /**
     * Logs events from the schema build process.
     */
    logSchemaBuild(message: string, queryExecutor?: QueryExecutor) {
        if (!this.isLogEnabledFor('schema-build')) {
            return;
        }

        this.writeLog(
            'schema',
            {
                type: 'schema-build',
                message,
            },
            queryExecutor,
        );
    }

    log(level: 'log' | 'info' | 'warn', message: any, queryExecutor?: QueryExecutor) {
        switch (level) {
            case 'log':
                if (!this.isLogEnabledFor('log')) {
                    return;
                }

                this.writeLog(
                    'log',
                    {
                        type: 'log',
                        message,
                    },
                    queryExecutor,
                );
                break;

            case 'info':
                if (!this.isLogEnabledFor('info')) {
                    return;
                }

                this.writeLog(
                    'info',
                    {
                        type: 'info',
                        prefix: 'info',
                        message,
                    },
                    queryExecutor,
                );
                break;

            case 'warn':
                if (!this.isLogEnabledFor('warn')) {
                    return;
                }

                this.writeLog(
                    'warn',
                    {
                        type: 'warn',
                        message,
                    },
                    queryExecutor,
                );
                break;
        }
    }

    protected isLogEnabledFor(type?: LogLevel | LogMessageType) {
        switch (type) {
            case 'query':
                return (
                    this.option === 'all' ||
                    this.option === true ||
                    (Array.isArray(this.option) && this.option.indexOf('query') !== -1)
                );

            case 'error':
            case 'query-error':
                return (
                    this.option === 'all' ||
                    this.option === true ||
                    (Array.isArray(this.option) && this.option.indexOf('error') !== -1)
                );

            case 'query-slow':
                return true;

            case 'schema':
            case 'schema-build':
                return (
                    this.option === 'all' ||
                    (Array.isArray(this.option) && this.option.indexOf('schema') !== -1)
                );

            case 'migration':
                return true;

            case 'log':
                return (
                    this.option === 'all' ||
                    (Array.isArray(this.option) && this.option.indexOf('log') !== -1)
                );

            case 'info':
                return (
                    this.option === 'all' ||
                    (Array.isArray(this.option) && this.option.indexOf('info') !== -1)
                );

            case 'warn':
                return (
                    this.option === 'all' ||
                    (Array.isArray(this.option) && this.option.indexOf('warn') !== -1)
                );

            default:
                return false;
        }
    }

    protected abstract writeLog(
        level: LogLevel,
        message: LogMessage | string | number | (LogMessage | string | number)[],
        queryExecutor?: QueryExecutor,
    ): void;

    protected prepareLogMessages(
        logMessage: LogMessage | string | number | (LogMessage | string | number)[],
        options?: Partial<PrepareLogMessagesOption>,
    ): LogMessage[] {
        options = {
            ...{
                addColonToPrefix: true,
                appendParameterAsComment: true,
                highlightSql: true,
            },
            ...options,
        };
        const messages = Array.isArray(logMessage) ? logMessage : [logMessage];

        for (let message of messages) {
            if (typeof message !== 'object') {
                message = {
                    message,
                };
            }

            if (message.format === 'sql') {
                let sql = String(message.message);

                if (options.appendParameterAsComment && message.params && message.params.length) {
                    sql += ` -- PARAMETERS: ${this.stringifyParams(message.params)}`;
                }

                if (options.highlightSql) {
                    sql = DialectPlatform.highlightSql(sql);
                }

                message.message = sql;
            }

            if (options.addColonToPrefix && message.prefix) {
                message.prefix += ':';
            }
        }

        return messages as LogMessage[];
    }

    protected stringifyParams(parameters: any[]) {
        try {
            return JSON.stringify(parameters);
        } catch (error) {
            return parameters;
        }
    }
}
