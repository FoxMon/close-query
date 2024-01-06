/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * `DialectPlatform.ts`
 */
export class DialectPlatform {
    readonly '_instance' = Symbol.for('DialectPlatform');

    static getGlobal(): typeof globalThis {
        return global;
    }

    static load(dialect: string) {
        try {
            switch (dialect) {
                case 'mysql':
                    return require('mysql');

                case 'mysql2':
                    return require('mysql2');

                default:
                    throw new TypeError(`Invalid pacakge for DialectPlatform.load: ${dialect}`);
            }
        } catch (error) {
            throw new Error('Unsupported platform');
        }
    }
}
