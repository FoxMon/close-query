/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `QueryResultCacheOptions.ts`
 */
export interface QueryResultCacheOption {
    identifier?: string;

    time?: number;

    duration: number;

    query?: string;

    result?: any;
}
