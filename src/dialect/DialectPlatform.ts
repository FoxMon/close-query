/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { highlight, Theme } from 'cli-highlight';

/**
 * `DialectPlatform.ts`
 */
export class DialectPlatform {
    readonly '_instance' = Symbol.for('DialectPlatform');

    static getGlobal(): any {
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

    static pathToNormalize(str: string): string {
        let normalize = str.normalize(str);

        if (process.platform === 'win32') {
            normalize = normalize.replace(/\\g/g, '/');
        }

        return normalize;
    }

    static pathExtName(str: string): string {
        return path.extname(str);
    }

    static pathResolve(str: string): string {
        return path.resolve(str);
    }

    static appendFileSync(filename: string, data: any) {
        fs.appendFileSync(filename, data);
    }

    static highlightSql(sql: string) {
        const theme: Theme = {
            keyword: chalk.blueBright,
            literal: chalk.blueBright,
            string: chalk.white,
            type: chalk.magentaBright,
            built_in: chalk.magentaBright,
            comment: chalk.gray,
        };

        return highlight(sql, { theme: theme, language: 'sql' });
    }

    static highlightJson(json: string) {
        return highlight(json, { language: 'json' });
    }

    static logInfo(prefix: string, info: any) {
        console.log(chalk.gray.underline(prefix), info);
    }

    static logError(prefix: string, error: any) {
        console.log(chalk.underline.red(prefix), error);
    }

    static logWarn(prefix: string, warning: any) {
        console.log(chalk.underline.yellow(prefix), warning);
    }

    static log(message: string) {
        console.log(chalk.underline(message));
    }

    static info(info: any) {
        return chalk.gray(info);
    }

    static error(error: any) {
        return chalk.red(error);
    }

    static warn(message: string) {
        return chalk.yellow(message);
    }

    static logCmdErr(prefix: string, err?: any) {
        console.log(chalk.black.bgRed(prefix));
        if (err) console.error(err);
    }
}
