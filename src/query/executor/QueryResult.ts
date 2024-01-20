/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `QueryResult.ts`
 *
 * Query의 실행 결과를 담는 class이다.
 */
export class QueryResult {
    readonly '_instance' = Symbol.for('QueryResult');

    raw: any;

    records: any[] = [];

    affected?: number;
}
