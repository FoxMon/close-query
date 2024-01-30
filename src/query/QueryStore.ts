/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `QueryStore.ts`
 *
 * Query에 필요한 파라미터 및 임시 데이터를 저장하는 class.
 */
export class QueryStore {
    readonly '_instance' = Symbol.for('QueryStore');

    query: string;

    params?: any[];

    constructor(query: string, params?: any[]) {
        this.query = query;

        this.params = params;
    }
}
