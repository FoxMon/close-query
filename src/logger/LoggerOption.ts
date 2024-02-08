import { LogLevel } from './Logger';

/**
 * `LoggerOption.ts`
 */

/**
 * Logging options
 */
export type LoggerOption = boolean | 'all' | LogLevel[];

/**
 * File logging option
 */
export type FileLoggerOption = {
    /**
     * Log path
     */
    logPath: string;
};
