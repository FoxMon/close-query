/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConnectorBuilder } from '../connector/ConnectorBuilder';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { CQDataStorage } from '../storage/CQDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';

/**
 * `CQUtil.ts`
 */
export class CQUtil {
    /**
     * Divide class and string
     */
    static divideClassesAndStrings<T>(target: (string | T)[]): [T[], string[]] {
        return [
            target.filter((t): t is T => typeof t !== 'string'),
            target.filter((t): t is string => typeof t === 'string'),
        ];
    }

    /**
     * Deep object assign
     */
    static mergeDeep(target: any, ...args: any[]): any {
        if (!args.length) {
            return target;
        }

        for (const arg of args) {
            CQUtil.mergeDeep(target, arg);
        }

        return target;
    }

    /**
     * Object's get deep value
     */
    static deepValue(obj: ObjectIndexType, path: string) {
        const segments = path.split('.');

        for (let i = 0, len = segments.length; i < len; i++) {
            obj = obj[segments[i]];
        }

        return obj;
    }

    /**
     * 같은 Array인지 비교
     */
    static isArraysEqual(arr1: any[], arr2: any[]): boolean {
        if (arr1.length !== arr2.length) {
            return false;
        }

        return arr1.every((element) => {
            return arr2.indexOf(element) !== -1;
        });
    }

    /**
     * Eager lazy load relation
     */
    static joinEagerRelations(
        qb: SelectQueryBuilder<any>,
        alias: string,
        dataStorage: CQDataStorage,
    ) {
        dataStorage.eagerRelations.forEach((relation) => {
            let relationAlias: string = ConnectorBuilder.buildAlias(
                qb.manager.connector,
                { joiner: '__' },
                alias,
                relation.propertyName,
            );

            let addJoin = true;

            for (const join of qb.queryExpression.joinAttributes) {
                if (
                    join.condition !== undefined ||
                    join.mapToProperty !== undefined ||
                    join.isMappingMany !== undefined ||
                    join.direction !== 'LEFT' ||
                    join.entityOrProperty !== `${alias}.${relation.propertyPath}`
                ) {
                    continue;
                }

                addJoin = false;
                relationAlias = join.alias.name;

                break;
            }

            const joinAlreadyAdded = Boolean(
                qb.queryExpression.joinAttributes.find(
                    (joinAttribute) => joinAttribute.alias.name === relationAlias,
                ),
            );

            if (addJoin && !joinAlreadyAdded) {
                qb.leftJoin(alias + '.' + relation.propertyPath, relationAlias);
            }

            let addSelect = true;
            for (const select of qb.queryExpression.selects) {
                if (
                    select.aliasName !== undefined ||
                    select.virtual !== undefined ||
                    select.select !== relationAlias
                ) {
                    continue;
                }

                addSelect = false;

                break;
            }

            if (addSelect) {
                qb.addSelect(relationAlias);
            }

            this.joinEagerRelations(qb, relationAlias, relation.inverseDataStorage);
        });
    }

    static propertyPathsToTruthyObject(paths: string[]) {
        const obj: any = {};

        for (const path of paths) {
            const props = path.split('.');

            if (!props.length) {
                continue;
            }

            if (!obj[props[0]] || obj[props[0]] === true) {
                obj[props[0]] = {};
            }

            let recursiveChild = obj[props[0]];

            for (const [key, prop] of props.entries()) {
                if (key === 0) {
                    continue;
                }

                if (recursiveChild[prop]) {
                    recursiveChild = recursiveChild[prop];
                } else if (key === props.length - 1) {
                    recursiveChild[prop] = {};
                    recursiveChild = null;
                } else {
                    recursiveChild[prop] = {};
                    recursiveChild = recursiveChild[prop];
                }
            }
        }

        this.replaceEmptyObjectsWithBooleans(obj);

        return obj;
    }

    static replaceEmptyObjectsWithBooleans(obj: any) {
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                if (Object.keys(obj[key]).length === 0) {
                    obj[key] = true;
                } else {
                    this.replaceEmptyObjectsWithBooleans(obj[key]);
                }
            }
        }
    }

    static uniq<T>(array: T[], criteria?: (item: T) => any): T[];
    static uniq<T, K extends keyof T>(array: T[], property: K): T[];
    static uniq<T, K extends keyof T>(
        array: T[],
        criteriaOrProperty?: ((item: T) => any) | K,
    ): T[] {
        return array.reduce((uniqueArray, item) => {
            let found: boolean = false;

            if (typeof criteriaOrProperty === 'function') {
                const itemValue = criteriaOrProperty(item);

                found = !!uniqueArray.find(
                    (uniqueItem) => criteriaOrProperty(uniqueItem) === itemValue,
                );
            } else if (typeof criteriaOrProperty === 'string') {
                found = !!uniqueArray.find(
                    (uniqueItem) => uniqueItem[criteriaOrProperty] === item[criteriaOrProperty],
                );
            } else {
                found = uniqueArray.indexOf(item) !== -1;
            }

            if (!found) {
                uniqueArray.push(item);
            }

            return uniqueArray;
        }, [] as T[]);
    }
}
