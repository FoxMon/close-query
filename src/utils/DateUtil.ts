/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `DateUtil.ts`
 *
 * Date를 다루는 Class 정의
 */
export class DateUtil {
    readonly _instance = Symbol.for('DateUtil');

    static simpleArrayToString(v: any[] | any): string[] | any {
        if (Array.isArray(v)) {
            return (v as any[]).map((idx) => String(idx)).join(',');
        }

        return v;
    }
}
