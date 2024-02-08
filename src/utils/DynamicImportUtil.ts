/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import glob from 'glob';
import path from 'path';
import fs from 'fs';
import { CheckerUtil } from './CheckerUtil';
import { ObjectUtil } from './ObjectUtil';
import { DialectPlatform } from '../dialect/DialectPlatform';
import { Logger } from '../logger/Logger';
import { pathToFileURL } from 'url';

/**
 * `DynamicImportUtil.ts`
 */
export class DynamicImportUtil {
    static async importClassesFromDirectories(
        logger: Logger,
        directories: string[],
        formats = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'],
    ): Promise<Function[]> {
        const logLevel = 'info';
        const classesNotFoundMessage = 'No classes were found using the provided glob pattern: ';
        const classesFoundMessage = 'All classes found using provided global pattern';

        function loadFileClasses(exported: any, allLoaded: Function[]) {
            if (typeof exported === 'function' || CheckerUtil.checkIsEntitySchema(exported)) {
                allLoaded.push(exported);
            } else if (Array.isArray(exported)) {
                exported.forEach((i: any) => loadFileClasses(i, allLoaded));
            } else if (ObjectUtil.isObject(exported)) {
                Object.keys(exported).forEach((key) => loadFileClasses(exported[key], allLoaded));
            }
            return allLoaded;
        }

        const allFiles = directories.reduce((allDirs, dir) => {
            return allDirs.concat(glob.sync(DialectPlatform.pathToNormalize(dir)));
        }, [] as string[]);

        if (directories.length > 0 && allFiles.length === 0) {
            logger.log(logLevel, `${classesNotFoundMessage} "${directories}"`);
        } else if (allFiles.length > 0) {
            logger.log(logLevel, `${classesFoundMessage} "${directories}" : "${allFiles}"`);
        }

        const dirPromises = allFiles
            .filter((file) => {
                const dtsExtension = file.substring(file.length - 5, file.length);
                return (
                    formats.indexOf(DialectPlatform.pathExtName(file)) !== -1 &&
                    dtsExtension !== '.d.ts'
                );
            })
            .map(async (file) => {
                const [importOrRequireResult] = await this.importOrRequireFile(
                    DialectPlatform.pathResolve(file),
                );
                return importOrRequireResult;
            });

        const dirs = await Promise.all(dirPromises);

        return loadFileClasses(dirs, []);
    }

    static async importOrRequireFile(
        filePath: string,
    ): Promise<[result: any, moduleType: 'esm' | 'commonjs']> {
        const tryToImport = async (): Promise<[any, 'esm']> => {
            return [
                await Function('return filePath => import(filePath)')()(
                    filePath.startsWith('file://') ? filePath : pathToFileURL(filePath).toString(),
                ),
                'esm',
            ];
        };

        const tryToRequire = async (): Promise<[any, 'commonjs']> => {
            return [require(filePath), 'commonjs'];
        };

        const extension = filePath.substring(filePath.lastIndexOf('.') + '.'.length);

        if (extension === 'mjs' || extension === 'mts') {
            return tryToImport();
        } else if (extension === 'cjs' || extension === 'cts') {
            return tryToRequire();
        } else if (extension === 'js' || extension === 'ts') {
            const packageJson = await this.getNearestPackageJson(filePath);

            if (packageJson != null) {
                const isModule = (packageJson as any)?.type === 'module';

                if (isModule) {
                    return tryToImport();
                } else {
                    return tryToRequire();
                }
            } else {
                return tryToRequire();
            }
        }

        return tryToRequire();
    }

    static getNearestPackageJson(filePath: string): Promise<object | null> {
        return new Promise((resolve) => {
            let curPath = filePath;

            function searchPackageJson() {
                const nextPath = path.dirname(curPath);

                if (curPath === nextPath) {
                    resolve(null);
                } else {
                    curPath = nextPath;

                    const packageJson = path.join(curPath, 'package.json');

                    fs.stat(packageJson, (err, stats) => {
                        if (err !== null) {
                            searchPackageJson();
                        } else if (stats.isFile()) {
                            fs.readFile(packageJson, 'utf8', (err, data) => {
                                if (err !== null) {
                                    resolve(null);
                                } else {
                                    try {
                                        resolve(JSON.parse(data));
                                    } catch (error) {
                                        resolve(null);
                                    }
                                }
                            });
                        } else {
                            searchPackageJson();
                        }
                    });
                }
            }

            searchPackageJson();
        });
    }
}
