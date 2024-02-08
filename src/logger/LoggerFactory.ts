import { ObjectUtil } from '../utils/ObjectUtil';
import { AdvancedConsoleLogger } from './AdvancedConsoleLogger';
import { DebugLogger } from './DebugLogger';
import { FileLogger } from './FileLogger';
import { Logger } from './Logger';
import { LoggerOption } from './LoggerOption';
import { SimpleConsoleLogger } from './SimpleConsoleLogger';

/**
 * `LoggerFactory.ts`
 *
 * Create logger class
 */
export class LoggerFactory {
    readonly _instance = Symbol.for('LoggerFactory');

    static create(
        logger?: 'advanced-console' | 'simple-console' | 'debug' | 'file' | Logger,
        option?: LoggerOption,
    ) {
        if (ObjectUtil.isObject(logger)) {
            return logger as Logger;
        }

        if (logger) {
            switch (logger) {
                case 'advanced-console': {
                    return new AdvancedConsoleLogger(option);
                }

                case 'simple-console': {
                    return new SimpleConsoleLogger(option);
                }

                case 'file': {
                    return new FileLogger(option);
                }

                case 'debug': {
                    return new DebugLogger();
                }
            }
        }

        return new AdvancedConsoleLogger(option);
    }
}
