import appRootPath from 'app-root-path';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { LogLevel, LogMessage } from './Logger';
import { LoggerBase } from './LoggerBase';
import { FileLoggerOption, LoggerOption } from './LoggerOption';
import { DialectPlatform } from '../dialect/DialectPlatform';

/**
 * `FileLogger.ts`
 */
export class FileLogger extends LoggerBase {
    readonly _instance = Symbol.for('FileLogger');

    readonly fileLoggerOption?: FileLoggerOption;

    constructor(option?: LoggerOption, fileLoggerOption?: FileLoggerOption) {
        super(option);

        this.fileLoggerOption = fileLoggerOption;
    }

    protected writeLog(
        level: LogLevel,
        logMessage: LogMessage | LogMessage[],
        _queryExecutor?: QueryExecutor,
    ) {
        const messages = this.prepareLogMessages(logMessage, {
            highlightSql: false,
            addColonToPrefix: false,
        });

        const strings: string[] = [];

        for (const message of messages) {
            switch (message.type ?? level) {
                case 'log':
                    strings.push(`[LOG]: ${message.message}`);
                    break;

                case 'schema-build':
                    strings.push(String(message.message));
                    break;

                case 'info':
                    strings.push(`[INFO]: ${message.message}`);
                    break;

                case 'query':
                    strings.push(`[QUERY]: ${message.message}`);
                    break;

                case 'warn':
                    strings.push(`[WARN]: ${message.message}`);
                    break;

                case 'query-slow':
                    if (message.prefix === 'execution time') {
                        continue;
                    }

                    this.write(
                        `[SLOW QUERY: ${message.additionalInfo?.time} ms]: ${message.message}`,
                    );
                    break;

                case 'error':
                case 'query-error':
                    if (message.prefix === 'query failed') {
                        strings.push(`[FAILED QUERY]: ${message.message}`);
                    } else if (message.type === 'query-error') {
                        strings.push(`[QUERY ERROR]: ${message.message}`);
                    } else {
                        strings.push(`[ERROR]: ${message.message}`);
                    }
                    break;
            }
        }

        this.write(strings);
    }

    /**
     * Writes given strings into the log file.
     */
    protected write(strings: string | string[]) {
        strings = Array.isArray(strings) ? strings : [strings];

        const basePath = appRootPath.path + '/';

        let logPath = 'ormlogs.log';

        if (this.fileLoggerOption && this.fileLoggerOption.logPath) {
            logPath = DialectPlatform.pathToNormalize(this.fileLoggerOption.logPath);
        }

        strings = (strings as string[]).map((str) => '[' + new Date().toISOString() + ']' + str);

        DialectPlatform.appendFileSync(basePath + logPath, strings.join('\r\n') + '\r\n'); // todo: use async or implement promises?
    }
}
