/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryExecutor } from '../query/executor/QueryExecutor';

/**
 * `Logger.ts`
 */
export interface Logger {
    /**
     * Log query & params
     */
    logQuery(query: string, params?: any[], queryExecutor?: QueryExecutor): any;

    /**
     * Log query failed
     */
    logQueryError(
        error: string | Error,
        query: string,
        parameters?: any[],
        queryExecutor?: QueryExecutor,
    ): any;

    /**
     * Logs slow query
     */
    logQuerySlow(
        time: number,
        query: string,
        parameters?: any[],
        queryExecutor?: QueryExecutor,
    ): any;

    /**
     * Log schema build
     */
    logSchemaBuild(message: string, queryExecutor?: QueryExecutor): any;

    /**
     * Perform logging using given logger, or by default to the console
     * Log has its own level and message
     */
    log(level: 'log' | 'info' | 'warn', message: any, queryExecutor?: QueryExecutor): any;
}

/**
 * Log level
 */
export type LogLevel = 'query' | 'schema' | 'error' | 'warn' | 'info' | 'log' | 'migration';

/**
 * Log message type
 */
export type LogMessage = {
    type?: LogMessageType;
    prefix?: string;
    message: string | number;
    format?: LogMessageFormat;
    params?: any[];
    additionalInfo?: Record<string, any>;
};

export type LogMessageFormat = 'sql';

/**
 * Log message type
 */
export type LogMessageType =
    | 'log'
    | 'info'
    | 'warn'
    | 'error'
    | 'query'
    | 'query-error'
    | 'query-slow'
    | 'schema-build'
    | 'migration';

/**
 * Prepare log message option
 */
export type PrepareLogMessagesOption = {
    highlightSql: boolean;
    appendParameterAsComment: boolean;
    addColonToPrefix: boolean;
};
