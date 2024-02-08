/**
 * `CQUtil.ts`
 */
export class CQUtil {
    static divideClassesAndStrings<T>(target: (string | T)[]): [T[], string[]] {
        return [
            target.filter((t): t is T => typeof t !== 'string'),
            target.filter((t): t is string => typeof t === 'string'),
        ];
    }
}
