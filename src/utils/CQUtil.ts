/* eslint-disable @typescript-eslint/no-explicit-any */

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
}
