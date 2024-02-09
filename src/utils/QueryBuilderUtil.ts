/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `QueryBuilderUtil.ts`
 */
export class QueryBuilderUtil {
    readonly _instance = Symbol.for('QueryBuilderUtil');

    static isAliasProperty(str: any): str is string {
        if (typeof str !== 'string' || str.indexOf('.') === -1) {
            return false;
        }

        const [aliasName, propertyName] = str.split('.');

        if (!aliasName || !propertyName) {
            return false;
        }

        if (str.indexOf('(') !== -1 || str.indexOf(')') !== -1) {
            return false;
        }

        return true;
    }
}
